import { isArray } from '@ember/array';
import Component from '@ember/component';
import {
  computed, get, observer, set, setProperties
} from '@ember/object';
import { alias, equal, union } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import ipaddr from 'ipaddr.js';
import { hash } from 'rsvp';
import Semver from 'semver';
import ClusterDriver from 'shared/mixins/cluster-driver';
import C from 'shared/utils/constants';
import { addQueryParams } from 'shared/utils/util';
import { DEFAULT_AKS_CONFIG, DEFAULT_AKS_NODE_POOL_CONFIG } from 'ui/models/cluster';
import { regionsWithAZs } from 'ui/utils/azure-choices';
import layout from './template';
import { satisfies, coerceVersion } from 'shared/utils/parse-version';

const NETWORK_POLICY = [
  {
    label: 'None',
    value: null
  },
  {
    label: 'Calico',
    value: 'calico'
  },
  {
    label:    'Azure (requires Azure CNI)',
    value:    'azure',
    disabled: true
  }
];
const CHINA_REGION_API_URL = 'https://management.chinacloudapi.cn/';
const CHINA_REGION_AUTH_URL = 'https://login.chinacloudapi.cn/';
const NETWORK_PLUGINS = [
  {
    label: 'Kubenet',
    value: 'kubenet'
  },
  {
    label: 'Azure CNI',
    value: 'azure'
  }
];
const LB_SKUS = [
  {
    label: 'Standard',
    value: 'Standard'
  },
  {
    label: 'Basic',
    value: 'Basic'
  }
];


// Because aks just put out 1.24.0 as a preview we're releasing it as experimental until we can adequately test it. https://github.com/rancher/dashboard/issues/6513
const EXPERIMENTAL_RANGE = '>= 1.24.0'

export default Component.extend(ClusterDriver, {
  globalStore:          service(),
  intl:                 service(),
  settings:             service(),
  versionChoiceService: service('version-choices'),
  layout,

  configField: 'aksConfig',

  clusterAdvanced:           false,
  clusterErrors:             null,
  clusterLocationSaved:      false,
  clusterLocationSaving:     false,
  disableAzs:                false,
  enabledAuthorizedIpRanges: false,
  errors:                    null,
  lbSkus:                    LB_SKUS,
  loadBalancerImmutable:     false,
  monitoringRegionConent:    [],
  networkPlugins:            NETWORK_PLUGINS,
  otherErrors:               null,
  regions:                   null,
  step:                      1,
  versions:                  null,
  vmSizes:                   null,
  originalSecret:            null,
  regionsWithAZs,

  defaultNodePoolConfig: DEFAULT_AKS_NODE_POOL_CONFIG,
  defaultAksConfig:      DEFAULT_AKS_CONFIG,

  defaultK8sVersionRange: alias(`settings.${ C.SETTING.VERSION_SYSTEM_K8S_DEFAULT_RANGE }`),
  editing:                equal('mode', 'edit'),
  isNew:                  equal('mode', 'new'),
  allErrors:              union('errors', 'otherErrors', 'clusterErrors'),

  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.aksConfig');

    if ( !config ) {
      config = this.globalStore.createRecord(JSON.parse(JSON.stringify(this.defaultAksConfig)));
      const defNodePool = this.globalStore.createRecord(JSON.parse(JSON.stringify(this.defaultNodePoolConfig)))

      setProperties(defNodePool, {
        isNew: true,
        name:  'agentpool',
      });
      set(config, 'nodePools', [defNodePool]);

      setProperties(this, {
        'cluster.aksConfig': config,
        'loadBalancerSku':   'Standard',
      });
    } else {
      if ( this.editing && this.importedClusterIsPending || (this.clusterIsPending && config?.privateCluster) ) {
        set(this, 'step', 4);
      } else {
        this.syncUpstreamConfig();

        const tags = { ...( config.tags || {} ) };

        set(this, 'tags', tags);

        if (!isEmpty(config?.authorizedIpRanges)) {
          set(this, 'enabledAuthorizedIpRanges', true);
        }
      }
    }

    let cur = config?.azureCredentialSecret;

    if ( cur && !cur.startsWith('cattle-global-data:') ) {
      cur = `cattle-global-data:${ cur }`;
    }

    set(this, 'originalSecret', cur);
  },

  actions: {
    addNodePool() {
      const config = get(this, `primaryResource.aksConfig`);
      const kubernetesVersion = get(config, 'kubernetesVersion');
      let nodePools = (get(config, 'nodePools') || []).slice();
      const npConfig = JSON.parse(JSON.stringify(this.defaultNodePoolConfig));

      if (!isArray(nodePools)) {
        nodePools = [];
      }

      const nodePool = this.globalStore.createRecord(npConfig);

      set(nodePool, 'mode', 'User')

      setProperties(nodePool, {
        orchestratorVersion: kubernetesVersion,
        isNew:               true,
      });

      nodePools.pushObject(nodePool);

      set(this, 'config.nodePools', nodePools);
    },

    removeNodePool(nodePool) {
      let { config: { nodePools = [] } } = this;

      if (!isEmpty(nodePools)) {
        nodePools.removeObject(nodePool);
      }

      set(this, 'config.nodePools', nodePools);
    },
    updateAuthorizedIpRanges(ipRanges) {
      set(this, 'config.authorizedIpRanges', ipRanges);
    },
    async finishAndSelectCloudCredential(cred) {
      // Workaround for when embedding in the dashboard UI
      // Need to go and fetch the cloud credentials again
      try {
        const store = get(this, 'globalStore');
        const creds = await store.findAll('cloudcredential', { forceReload: true });

        if (creds?.content) {
          set(this, 'cloudCredentials', creds.content);
        }
      } catch (err) {
        console.warn('Unable to fetch cloud credentials', err); // eslint-disable-line
      }

      if (cred) {
        set(this, 'config.azureCredentialSecret', get(cred, 'id'));
        this.send('loadRegions', (ok, error) => {
          if (!ok) {
            this.send('errorHandler', error);
          }
        });
      }
    },
    async loadRegions(cb) {
      const store = get(this, 'globalStore')
      const selectedCloudCredential = this.selectedCloudCredential;
      const regionsWithAZs = this.regionsWithAZs
      const data = {
        cloudCredentialId: get(selectedCloudCredential, 'id'),
        // tenantId:          get(this, 'config.tenantId'),
      };
      const url = addQueryParams('/meta/aksLocations', data);

      try {
        const regions = await store.rawRequest({
          url,
          method: 'GET',
        });

        const filteredRegions = (regions?.body ?? []).map((reg) => {
          if (regionsWithAZs.includes(reg?.displayName || '')) {
            return {
              ...reg,
              ...{ group: 'High Availablity' }
            }
          } else {
            return {
              ...reg,
              ...{ group: 'Other' }
            };
          }
        });

        set(this, 'regions', filteredRegions);

        const location = get(this, 'config.resourceLocation');

        if (!location || !filteredRegions.findBy('name', location)){
          set(this, 'config.resourceLocation', filteredRegions[0].name || '');
        }

        cb(true);

        set(this, 'step', 2);

        if (this.editing) {
          set(this, 'clusterLocationSaving', true);
          this.send('authenticate', (ok, error) => {
            if (!ok) {
              this.send('errorHandler', error);
            }
            set(this, 'clusterLocationSaving', false);
          })
        }
      } catch (error) {
        this.send('errorHandler', error);
        cb(false);
      }
    },

    authenticate(cb) {
      const store = get(this, 'globalStore')
      const { selectedCloudCredential } = this;
      const data = {
        cloudCredentialId: get(selectedCloudCredential, 'id'),
        // tenantId:          get(this, 'config.tenantId'),
        region:            get(this, 'config.resourceLocation'),
        clusterId:         get(this, 'cluster.id')
      };

      if ( get(this, 'isChinaRegion') ) {
        setProperties(data, {
          baseUrl:     CHINA_REGION_API_URL,
          authBaseUrl: CHINA_REGION_AUTH_URL
        })
      }

      const versionsUrl = addQueryParams('/meta/aksVersions', data);
      const upgradesUrl = addQueryParams('/meta/aksUpgrades', data);
      const vNetsUrl = addQueryParams('/meta/aksVirtualNetworks', data);
      const vmSizes = addQueryParams('/meta/aksVMSizes', data);

      const aksRequest = {
        versions: store.rawRequest({
          url:    versionsUrl,
          method: 'GET',
        }),
        upgradeVersions: data.clusterId ? store.rawRequest({
          url:    upgradesUrl,
          method: 'GET'
        }) : Promise.resolve({}),
        virtualNetworks: store.rawRequest({
          url:    vNetsUrl,
          method: 'GET',
        }),
        vmSizes: store.rawRequest({
          url:    vmSizes,
          method: 'GET',
        }),
      }

      return hash(aksRequest).then((resp) => {
        const { mode }                      = this;
        const {
          versions, upgradeVersions, virtualNetworks, vmSizes
        } = resp;

        const isEdit                        = mode === 'edit';
        const versionz                      = (get(versions, 'body') || []);
        const upgradeVersionz               = (get(upgradeVersions, 'body.upgrades') || []);
        const nonExperimentalVersions       = versionz.filter((v) =>  !satisfies(coerceVersion(v), EXPERIMENTAL_RANGE));
        const initialVersion                = isEdit ? this.config.kubernetesVersion : Semver.maxSatisfying(nonExperimentalVersions, this.defaultK8sVersionRange); // default in azure ui

        if (!isEdit && initialVersion) {
          set(this, 'cluster.aksConfig.kubernetesVersion', initialVersion);
        }

        const enabledVersions = upgradeVersionz
          .filter((upgrade) => upgrade.enabled)
          .map((upgrade) => upgrade.version);

        setProperties(this, {
          step:            3,
          versions:        enabledVersions.length > 0 ? [initialVersion, ...enabledVersions] : versionz,
          virtualNetworks: (get(virtualNetworks, 'body') || []),
          vmSizes:         vmSizes?.body || [],
        });

        cb(true);
      }).catch((xhr) => {
        const err = get(xhr, 'body.message') || get(xhr, 'body.code') || get(xhr, 'body.error') || xhr;
        const translation = this.intl.t('clusterNew.azureaks.location.error', { error: err });

        setProperties(this, { errors: [translation], });
        cb(true);
      });
    },

    setTags(section) {
      set(this, 'config.tags', section);
    },
  },

  resetNetworkPolicy: observer('config.{networkPolicy,networkPlugin}', function() {
    const { networkPolicy, networkPlugin } = this.config;

    if (networkPlugin === 'kubenet' && networkPolicy === 'azure') {
      set(this, 'config.networkPolicy', null);
    }

    if (this.config.networkPolicy === null) {
      set(this, 'cluster.enableNetworkPolicy', false)
    }
  }),

  resetIpRanges: observer('config.privateCluster', 'loadBalancerSku', function() {
    if (( this.config?.privateCluster || this.loadBalancerSku === 'Basic' ) && !isEmpty(this.config?.authorizedIpRanges)) {
      setProperties(this, {
        'config.authorizedIpRanges': [],
        enabledAuthorizedIpRanges:   false,
      });
    }
  }),

  resourceLocationChanged: observer('config.resourceLocation', 'regions', function() {
    const { regions, config: { resourceLocation } } = this;

    if (!regions){
      return;
    }

    const match = regions.findBy('name', resourceLocation);

    const regionHasAz = this.regionsWithAZs.includes(match?.displayName || '');

    if (regionHasAz) {
      set(this, 'disableAzs', false);
    } else {
      set(this, 'disableAzs', true);
    }
  }),

  postSaveChanged: observer('isPostSave', function() {
    const {
      isNew,
      isPostSave,
      config: { privateCluster },
      importedClusterIsPending,
    } = this;

    if ((privateCluster || importedClusterIsPending) && isPostSave) {
      if (isNew) {
        set(this, 'step', 4);
      } else {
        this.close();
      }
    } else {
      this.close();
    }
  }),

  availablityZonesChanged: on('init', observer('config.nodePools.[]', function() {
    const nodePools = get(this, 'config.nodePools') || [];
    const azs = [];

    nodePools.forEach((np) => {
      if (np?.availabilityZones && np.availabilityZones.length > 0) {
        azs.pushObjects(np.availabilityZones);
      }
    });
    const anySet = azs.uniq().any((az) => az);

    if (anySet) {
      setProperties(this, {
        'loadBalancerSku':       'Standard',
        'loadBalancerImmutable': true,
      });
    } else {
      set(this, 'loadBalancerImmutable', false);
    }
  })),

  resetAdvancedOptions: on('init', observer('config.networkPlugin', function() {
    if (get(this, 'isNew') && get(this, 'config.networkPlugin') === 'azure') {
      const config = get(this, 'config');
      const defaultConfigOptions = {
        dnsServiceIp:                '10.0.0.10',
        dockerBridgeCidr:            '172.17.0.1/16',
        podCidr:                     '172.244.0.0/16',
        serviceCidr:                 '10.0.0.0/16',
        subnet:                      '',
        virtualNetwork:              '',
        virtualNetworkResourceGroup: '',
      };
      const {
        subnet,
        virtualNetwork,
        virtualNetworkResourceGroup,
        serviceCidr,
        dnsServiceIp,
        dockerBridgeCidr
      } = defaultConfigOptions;

      setProperties(config, {
        subnet,
        virtualNetwork,
        virtualNetworkResourceGroup,
        serviceCidr,
        dnsServiceIp,
        dockerBridgeCidr
      });
    }
  })),

  monitoringConfigDisabled: computed('model.originalCluster.aksStatus.upstreamSpec.monitoring', 'isNewOrEditable', 'editing', function(){
    const { isNewOrEditable, editing } = this;
    const upstreamMonitoringEnabled = get(this, 'model.originalCluster.aksStatus.upstreamSpec.monitoring') ?? false;

    if (isNewOrEditable) {
      return false;
    }

    if (editing && !upstreamMonitoringEnabled) {
      return false;
    }

    return true;
  }),

  importedClusterIsPending: computed('clusterIsPending', 'model.originalCluster', function() {
    const { clusterIsPending } = this;
    const originalCluster = get(this, 'model.originalCluster');
    const ourClusterSpec = get(( originalCluster ?? {} ), 'aksConfig');
    const upstreamSpec = get(( originalCluster ?? {} ), 'aksStatus.upstreamSpec');

    return clusterIsPending && get(ourClusterSpec, 'imported') && !isEmpty(upstreamSpec);
  }),

  clusterIsPending: computed('clusterState', function() {
    const { clusterState } = this;

    return ['pending', 'provisioning', 'waiting'].includes(clusterState);
  }),

  anyWindowsNodes: computed('config.nodePools.@each.osType', function() {
    const nodePools = this?.config?.nodePools ?? [];

    if (isEmpty(nodePools)) {
      return false;
    }

    return nodePools.any((np) => np?.osType === 'Windows');
  }),

  hasProvisioned: computed('model.cluster', function() {
    const cluster = get(this, 'model.cluster');
    const { state = '', isError = false } = cluster;
    let clusterHasProvisioned = true;

    if (isError && state === 'provisioning') {
      if (isEmpty(cluster?.aksStatus?.upstreamSpec)) {
        clusterHasProvisioned = false;
      }
    }

    return clusterHasProvisioned;
  }),

  isNewOrEditable:   computed('hasProvisioned', 'isNew', 'mode', function() {
    const isNew = get(this, 'isNew');

    if (isNew) {
      return true;
    }

    return this.mode === 'edit' && !this.hasProvisioned;
  }),

  cloudCredentials: computed('model.cloudCredentials', 'originalSecret', function() {
    const out = this.model.cloudCredentials.filter((cc) => {
      const isAzure = Object.prototype.hasOwnProperty.call(cc, 'azurecredentialConfig');

      if (isAzure) {
        return true;
      }

      return false;
    });

    if ( this.originalSecret && !out.find((x) => x.id === this.originalSecret ) ) {
      const obj = this.globalStore.createRecord({
        name:                  `${ this.originalSecret.replace(/^cattle-global-data:/, '') } (current)`,
        id:                    this.originalSecret,
        type:                  'cloudCredential',
        azurecredentialConfig: {},
      });

      out.push(obj);
    }

    return out;
  }),

  selectedCloudCredential: computed('cloudCredentials.@each.id', 'config.azureCredentialSecret', function() {
    const cur = this.config?.azureCredentialSecret;
    const  cloudCredentials = this.cloudCredentials;

    if (isEmpty(cloudCredentials) && isEmpty(cur)) {
      return null;
    } else {
      return cloudCredentials.findBy('id', cur.includes('cattle-global-data:') ? cur : `cattle-global-data:${ cur }`);
    }
  }),

  versionChoices: computed('versions', function() {
    const {
      versions = [],
      mode,
      config : { kubernetesVersion: initialVersion }
    } = this;

    // azure versions come in oldest to newest
    return this.versionChoiceService.parseCloudProviderVersionChoices(( versions || [] ).reverse(), initialVersion, mode, null, false, EXPERIMENTAL_RANGE);
  }),

  networkChoice: computed({
    set( _key, value = '' ) {
      const [subnet, virtualNetwork, virtualNetworkResourceGroup] = value.split(':');
      const config = get(this, 'config');

      if (subnet && virtualNetwork && virtualNetworkResourceGroup) {
        setProperties(config, {
          subnet,
          virtualNetwork,
          virtualNetworkResourceGroup
        });
      }

      return value;
    }
  }),

  filteredVirtualNetworks: computed('config.virtualNetwork', 'virtualNetworks', function() {
    const vnets = get(this, 'virtualNetworks') || [];
    const subNets = [];

    vnets.forEach( (vnet) => {
      (get(vnet, 'subnets') || []).forEach( (subnet) => {
        subNets.pushObject({
          name:  `${ get(subnet, 'name') } (${ get(subnet, 'addressRange') })`,
          group: get(vnet, 'name'),
          value: `${ get(subnet, 'name') }:${ get(vnet, 'name') }:${ get(vnet, 'resourceGroup') }`
        })
      });
    });

    return subNets;
  }),

  networkChoiceDisplay: computed('virtualNetworks', 'config.virtualNetwork', 'config.subnet', function() {
    const selected = (get(this, 'virtualNetworks') || []).findBy('name', get(this, 'config.virtualNetwork')) || {}
    const subnet = (get(selected, 'subnets') || []).findBy('name', get(this, 'config.subnet')) || {}

    return `${ get(subnet, 'name') } (${ get(subnet, 'addressRange') })`
  }),

  isChinaRegion: computed('config.resourceLocation', function() {
    return get(this, 'config.resourceLocation').startsWith('china');
  }),

  networkPolicyContent: computed('config.networkPlugin', function() {
    const netPolicies = [...NETWORK_POLICY];
    const azureNetPolicy = netPolicies.findBy('value', 'azure');

    if (this?.config?.networkPlugin === 'azure') {
      set(azureNetPolicy, 'disabled', false);
    } else {
      set(azureNetPolicy, 'disabled', true);
    }

    return netPolicies;
  }),

  validate() {
    const intl   = get(this, 'intl');
    let model = get(this, 'cluster');
    let clusterErrors = model.validationErrors() || [];
    const nodePoolErrors = this.validateNodePools();

    const vnetSet = !!get(this, 'config.virtualNetwork');

    if (vnetSet) {
      clusterErrors = clusterErrors.concat(this.validateVnetInputs());
    }

    if ( this.isNew && !get(this, 'config.resourceGroup') ) {
      clusterErrors.push(intl.t('validation.required', { key: intl.t('clusterNew.azureaks.resourceGroup.label') }));
    }

    if ( this.isNew && !get(this, 'config.dnsPrefix') ) {
      clusterErrors.push(intl.t('validation.required', { key: intl.t('clusterNew.azureaks.dns.label') }));
    }

    set(this, 'errors', [...(this.errors ?? []), ...clusterErrors, ...nodePoolErrors]);

    return this.errors.length === 0;
  },

  validateNodePools() {
    const nodePools = get(this, 'primaryResource.aksConfig.nodePools');
    const errors = [];

    if (!isEmpty(nodePools)) {
      const nodePoolErrors = [];

      nodePools.forEach((np) => {
        const npErr = np.validationErrors();
        const npOs = np?.osType;
        const npName = np?.name;

        // aka.ms/aks-naming-rules
        if (npOs === 'Linux') {
          if (npName.length > 11) {
            errors.push(this.intl.t('clusterNew.azureaks.nodePools.errors.linuxName'));
          }
        } else if (npOs === 'Windows') {
          if (npName.length > 6) {
            errors.push(this.intl.t('clusterNew.azureaks.nodePools.errors.windowsName'));
          }
        }

        if (!/^[a-z][a-z0-9]+$/.test(npName)) {
          errors.push(this.intl.t('clusterNew.azureaks.nodePools.errors.nameFormat'));
        }

        nodePoolErrors.push(npErr)
      });

      if (!isEmpty(nodePoolErrors)) {
        errors.pushObjects(nodePoolErrors.flat());
      }
    }

    return errors;
  },

  validateVnetInputs() {
    const intl   = get(this, 'intl');
    const errors = [];
    const config = get(this, 'config');
    const vnet   = get(this, 'virtualNetworks').findBy('name', get(config, 'virtualNetwork'));

    if (vnet) {
      let subnet = get(vnet, `subnets`).findBy('name', get(config, 'subnet'));
      let vnetRange  = ipaddr.parseCIDR(get(subnet, 'addressRange'));

      let {
        serviceCidr, dnsServiceIp, dockerBridgeCidr
      } = config;

      let parsedServiceCidr      = null;
      let parsedDnsServiceIp     = null;
      let parsedDockerBridgeCidr = null;

      if (!serviceCidr && !dnsServiceIp && !dockerBridgeCidr) {
        errors.pushObject('You must include all required fields when using a Virtual Network');
      }

      try {
        parsedServiceCidr = ipaddr.parseCIDR(serviceCidr);

        // check if serviceCidr falls within the VNet/Subnet range
        if (parsedServiceCidr && vnetRange[0].match(parsedServiceCidr)) {
          errors.pushObject(intl.t('clusterNew.azureaks.errors.included.parsedServiceCidr'));
        }
      } catch ( err ) {
        errors.pushObject(intl.t('clusterNew.azureaks.errors.included.serviceCidr'));
      }

      try {
        parsedDnsServiceIp = ipaddr.parse(dnsServiceIp);

        // check if dnsService exists in range
        if (parsedDnsServiceIp && vnetRange[0].match(parsedDnsServiceIp, vnetRange[1])) {
          errors.pushObject(intl.t('clusterNew.azureaks.errors.included.parsedDnsServiceIp'));
        }
      } catch ( err ) {
        errors.pushObject(intl.t('clusterNew.azureaks.errors.included.dnsServiceIp'));
      }

      try {
        parsedDockerBridgeCidr = ipaddr.parseCIDR(dockerBridgeCidr);

        // check that dockerBridge doesn't overlap
        if (parsedDockerBridgeCidr && ( vnetRange[0].match(parsedDockerBridgeCidr) || parsedServiceCidr[0].match(parsedDockerBridgeCidr) )) {
          errors.pushObject(intl.t('clusterNew.azureaks.errors.included.parsedDockerBridgeCidr'));
        }
      } catch ( err ) {
        errors.pushObject(intl.t('clusterNew.azureaks.errors.included.dockerBridgeCidr'));
      }
    }

    return errors;
  },

  willSave() {
    const enableMonitoring = get(this, 'config.monitoring')
    const config = get(this, 'config')

    if (!enableMonitoring) {
      setProperties(config, {
        logAnalyticsWorkspaceResourceGroup: null,
        logAnalyticsWorkspace:              null,
      })
    }

    set(config, 'clusterName', this.cluster.name);

    if ( get(this, 'isChinaRegion') ) {
      setProperties(config, {
        baseUrl:     CHINA_REGION_API_URL,
        authBaseUrl: CHINA_REGION_AUTH_URL
      })
    } else {
      delete config['baseUrl'];
      delete config['authBaseUrl'];
    }

    Object.keys(config).forEach((k) => {
      const val = get(config, k);

      if (isEmpty(val)) {
        delete config[k];
      }
    });

    return this._super(...arguments);
  },

  syncUpstreamConfig() {
    const originalCluster = get(this, 'model.originalCluster').clone();
    const ourClusterSpec = get(originalCluster, 'aksConfig');
    const upstreamSpec = get(originalCluster, 'aksStatus.upstreamSpec');

    if (!isEmpty(upstreamSpec)) {
      Object.keys(upstreamSpec).forEach((k) => {
        if (isEmpty(get(ourClusterSpec, k)) && !isEmpty(get(upstreamSpec, k))) {
          set(this, `config.${ k }`, get(upstreamSpec, k));
        }
      });
    }
  },
});
