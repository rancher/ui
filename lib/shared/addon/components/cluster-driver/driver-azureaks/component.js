import ClusterDriver from 'shared/mixins/cluster-driver';
import Component from '@ember/component'
import {
  computed, get, set, setProperties, observer
} from '@ember/object';
import { alias } from '@ember/object/computed';
import layout from './template';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { on } from '@ember/object/evented';
import ipaddr from 'ipaddr.js';
import { equal } from '@ember/object/computed'
import C from 'shared/utils/constants';
import Semver  from 'semver';

import {
  sizes,
  aksRegions,
} from 'ui/utils/azure-choices';

const NETWORK_POLICY = ['Calico']
const CHINA_REGION_API_URL = 'https://management.chinacloudapi.cn/';
const CHINA_REGION_AUTH_URL = 'https://login.chinacloudapi.cn/';
const NETWORK_PLUGINS = [
  {
    label: 'Kubenet',
    value: 'kubenet'
  },
  {
    label: 'Azure',
    value: 'azure'
  }
];

export default Component.extend(ClusterDriver, {
  globalStore:          service(),
  intl:                 service(),
  settings:             service(),
  versionChoiceService: service('version-choices'),
  layout,

  configField:  'azureKubernetesServiceConfig',

  zones:                  aksRegions,
  versions:               null,
  machineSizes:           sizes,
  step:                   1,
  netMode:                'default',
  monitoringRegionConent: [],
  networkPlugins:         NETWORK_PLUGINS,
  defaultK8sVersionRange: alias(`settings.${ C.SETTING.VERSION_SYSTEM_K8S_DEFAULT_RANGE }`),

  editing:       equal('mode', 'edit'),
  isNew:         equal('mode', 'new'),

  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.azureKubernetesServiceConfig');

    if ( !config ) {
      config = this.get('globalStore').createRecord({
        agentPoolName:                'rancher',
        type:                         'azureKubernetesServiceConfig',
        agentOsdiskSize:              100,
        adminUsername:                'azureuser',
        count:                        3,
        agentVmSize:                  'Standard_D2_v2',
        location:                     'eastus',
        enableHttpApplicationRouting: false,
        enableMonitoring:             true,
      });

      set(this, 'cluster.azureKubernetesServiceConfig', config);
    } else {
      const tags = get(config, 'tags') || []
      const map = {}

      tags.map((t = '') => {
        const split = t.split('=')

        set(map, split[0], split[1])
      })
      set(this, 'tags', map)

      if (get(config, 'networkPolicy') || get(config, 'subnet')) {
        set(this, 'netMode', 'advanced')
      }
    }
  },

  actions: {
    authenticate(cb) {
      const store = get(this, 'globalStore')
      const data = {
        clientId:       get(this, 'config.clientId'),
        clientSecret:   get(this, 'config.clientSecret'),
        subscriptionId: get(this, 'config.subscriptionId'),
        tenantId:       get(this, 'config.tenantId'),
        region:         get(this, 'config.location')
      };

      if ( get(this, 'isChinaRegion') ) {
        setProperties(data, {
          baseUrl:     CHINA_REGION_API_URL,
          authBaseUrl: CHINA_REGION_AUTH_URL
        })
      }

      const aksRequest = {
        versions: store.rawRequest({
          url:    '/meta/aksVersions',
          method: 'POST',
          data
        }),
        virtualNetworks: store.rawRequest({
          url:    '/meta/aksVirtualNetworks',
          method: 'POST',
          data
        })
      }

      return hash(aksRequest).then((resp) => {
        const { mode }                      = this;
        const { versions, virtualNetworks } = resp;
        const isEdit                        = mode === 'edit';
        const versionz                      = (get(versions, 'body') || []);
        const initialVersion                = isEdit ? this.config.kubernetesVersion : Semver.maxSatisfying(versionz, this.defaultK8sVersionRange);

        if (!isEdit && initialVersion) {
          set(this, 'cluster.azureKubernetesServiceConfig.kubernetesVersion', initialVersion);
        }

        setProperties(this, {
          step:            2,
          versions:        (get(versions, 'body') || []),
          virtualNetworks: (get(virtualNetworks, 'body') || []),
        });

        cb(true);
      }).catch((xhr) => {
        const err = xhr.body.message || xhr.body.code || xhr.body.error;

        setProperties(this, { errors: [err], });

        cb(false, [err]);
      });
    },

    setTags(section) {
      const out = []

      for (let key in section) {
        out.pushObject(`${ key }=${ section[key] }`)
      }
      set(this, 'config.tags', out);
    },
  },

  resetAdvancedOptions: on('init', observer('netMode', function() {
    if (get(this, 'isNew') && get(this, 'netMode') === 'default') {
      const config = get(this, 'config');
      let {
        subnet,
        virtualNetwork,
        virtualNetworkResourceGroup,
        serviceCidr,
        dnsServiceIp,
        dockerBridgeCidr
      } = this.globalStore.getById('schema', 'azurekubernetesserviceconfig').getCreateDefaults();

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

  versionChoices: computed('versions', function() {
    const {
      versions = [],
      mode,
      config : { kubernetesVersion: initialVersion }
    } = this;

    // azure versions come in oldest to newest
    return this.versionChoiceService.parseCloudProviderVersionChoices(( versions || [] ).reverse(), initialVersion, mode);
  }),

  networkChoice: computed({
    set( key, value = '' ) {
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

  isEditable: computed('mode', function() {
    return ( get(this, 'mode') === 'edit' || get(this, 'mode') === 'new' ) ? true : false;
  }),

  isChinaRegion: computed('config.location', function() {
    return get(this, 'config.location').startsWith('china');
  }),

  saveDisabled: computed('config.subscriptionId', 'config.tenantId', 'config.clientId', 'config.clientSecret', 'config.location', function() {
    return get(this, 'config.tenantId') && get(this, 'config.clientId') && get(this, 'config.clientSecret') && get(this, 'config.subscriptionId') && get(this, 'config.location') ? false : true;
  }),

  networkPolicyContent: computed(() => {
    return NETWORK_POLICY.map((n) => {
      return {
        label: n,
        value: n,
      }
    })
  }),

  validate() {
    const intl   = get(this, 'intl');
    let model = get(this, 'cluster');
    let errors = model.validationErrors() || [];

    const vnetSet = !!get(this, 'config.virtualNetwork');

    if (vnetSet) {
      errors = errors.concat(this.validateVnetInputs());
    }

    if ( !get(this, 'config.resourceGroup') ) {
      errors.push(intl.t('validation.required', { key: intl.t('clusterNew.azureaks.resourceGroup.label') }));
    }

    if ( !get(this, 'config.sshPublicKeyContents') ) {
      errors.push(intl.t('validation.required', { key: intl.t('clusterNew.azureaks.ssh.label') }));
    }

    set(this, 'errors', errors);

    return errors.length === 0;
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
    const enableMonitoring = get(this, 'config.enableMonitoring')
    const config = get(this, 'config')

    if (enableMonitoring) {
      setProperties(config, {
        logAnalyticsWorkspaceResourceGroup: '',
        logAnalyticsWorkspace:              '',
      })
    } else {
      setProperties(config, {
        logAnalyticsWorkspaceResourceGroup: null,
        logAnalyticsWorkspace:              null,
      })
    }

    if ( get(this, 'isChinaRegion') ) {
      setProperties(config, {
        baseUrl:     CHINA_REGION_API_URL,
        authBaseUrl: CHINA_REGION_AUTH_URL
      })
    } else {
      delete config['baseUrl'];
      delete config['authBaseUrl'];
    }

    return this._super(...arguments);
  },
});
