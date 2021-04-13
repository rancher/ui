import { isArray } from '@ember/array';
import Component from '@ember/component';
import {
  computed, get, observer, set, setProperties
} from '@ember/object';
import { alias, equal, union } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { all } from 'rsvp';
import ClusterDriver from 'shared/mixins/cluster-driver';
import { sortableNumericSuffix } from 'shared/utils/util';
import { DEFAULT_GKE_CONFIG, DEFAULT_GKE_NODE_POOL_CONFIG } from 'ui/models/cluster';
import layout from './template';

export default Component.extend(ClusterDriver, {
  google:          service(),
  intl:            service(),
  serivceVersions: service('version-choices'),
  layout,

  configField: 'gkeConfig',

  step:                     1,
  errors:                   null,
  otherErrors:              null,
  clusterErrors:            null,
  save:                     false,
  clusterAdvanced:          false,
  maintenanceWindowTimes:   null,
  locationType:             null,
  monitoringServiceChoices: null,
  loggingServiceChoices:    null,
  sharedSubnets:            null,
  clusterLocationSaved:     false,
  clusterLocationSaving:    false,

  allErrors: union('errors', 'otherErrors', 'clusterErrors'),
  isNew:     equal('mode', 'new'),
  editing:   equal('mode', 'edit'),

  clusterState: alias('model.originalCluster.state'),

  init() {
    this._super(...arguments);

    setProperties(this, {
      errors:                   [],
      otherErrors:              [],
      clusterErrors:            [],
      maintenanceWindowTimes:   this.google.maintenanceWindows,
      locationType:             this.google.defaultZoneType,
      monitoringServiceChoices: [
        {
          label: this.intl.t('generic.none'),
          value: 'none'
        },
        {
          label: this.intl.t('clusterNew.googlegke.monitoringService.default'),
          value: 'monitoring.googleapis.com/kubernetes'
        },
      ],
      loggingServiceChoices:    [
        {
          label: this.intl.t('generic.none'),
          value: 'none'
        },
        {
          label: this.intl.t('clusterNew.googlegke.loggingService.default'),
          value: 'logging.googleapis.com/kubernetes'
        },
      ],
    });

    let config = get(this, 'cluster.gkeConfig');

    if (!config) {
      config = this.globalStore.createRecord(this.defaultConfig());

      set(this, 'cluster.gkeConfig', config);
    } else {
      if ( this.editing && this.clusterIsPending ) {
        set(this, 'step', 5);
      } else {
        this.syncUpstreamConfig();

        const initalTags = { ...( config.tags || {} ) };

        set(this, 'initalTags', initalTags);
      }
    }

    setProperties(this, {
      locationType:         get(this, 'config.zone') ? this.google.defaultZoneType :  this.google.defaultRegionType,
      regionChoices:        this.google.regions.map((region) => ({ name: region })),
    });
  },

  actions: {
    finishAndSelectCloudCredential(cred) {
      if (cred) {
        next(this, () => {
          set(this, 'config.googleCredentialSecret', get(cred, 'id'));

          if (cred?.googlecredentialConfig?.projectId) {
            set(this, 'config.projectID', cred.googlecredentialConfig.projectId);
            this.send('loadZones');
          }
        })
      }
    },

    addNodePool() {
      let { config } = this;
      let { nodePools = [], kubernetesVersion } = config;
      const npConfig = { ...DEFAULT_GKE_NODE_POOL_CONFIG };

      if (!isArray(nodePools)) {
        nodePools = [];
      }

      const nodePool = this.globalStore.createRecord(npConfig);

      set(nodePool, 'version', kubernetesVersion);

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

    loadZones(cb = () => {}) {
      set(this, 'errors', []);

      const config = get(this, `cluster.${ this.configField }`);

      return all([
        this.google.fetchZones(config, this.saved),
      ]).then((resp) => {
        const [zones] = resp;

        setProperties(this, {
          step: 2,
          zones,
        });

        if (this.editing) {
          set(this, 'clusterLocationSaving', true);
          this.send('checkServiceAccount', () => {
            setProperties(this, {
              clusterLocationSaving: false,
              clusterLocationSaved:  true,
            });
          });
        }

        cb(true);
      }).catch((err) => {
        this.send('errorHandler', err);

        cb(false);
      });
    },

    checkServiceAccount(cb = () => {}) {
      set(this, 'errors', []);

      const config = get(this, `cluster.${ this.configField }`);

      return all([
        this.google.fetchVersions(config, this.saved),
        this.google.fetchMachineTypes(config, this.saved),
        this.google.fetchNetworks(config, this.saved),
        this.google.fetchSubnetworks(config, get(this, 'locationType'), this.saved),
        this.google.fetchSharedSubnets(config, this.saved),
        this.google.fetchServiceAccounts(config, this.saved),
      ]).then((resp) => {
        const [versions, machineTypes, networks, subNetworks, sharedSubnets, servicesAccounts] = resp;

        setProperties(this, {
          step: 3,
          subNetworks,
          machineTypes,
          networks,
          servicesAccounts,
          sharedSubnets,
          versions,
        })

        // const filter = servicesAccounts.filter((o) => o.displayName === 'Compute Engine default service account')

        if (get(this, 'mode') === 'new') {
          // set(this, 'config.serviceAccount', filter?.firstObject && filter.firstObject.uniqueId)
          set(this, 'config.network', networks?.firstObject && networks.firstObject.name)
        }

        if (isEmpty(config.kubernetesVersion)) {
          set(this, 'config.kubernetesVersion', versions?.defaultClusterVersion);
        }

        cb(true);
      }).catch((err) => {
        this.send('errorHandler', err);

        cb(false);
      });
    },

    addMSAN() {
      const cidrBlocks = (this.config?.masterAuthorizedNetworks?.cidrBlocks ?? []).slice();

      cidrBlocks.pushObject(this.globalStore.createRecord({
        cidrBlock:   '',
        displayName: '',
        type:        'cidrblock',
      }));

      set(this, 'config.masterAuthorizedNetworks.cidrBlocks', cidrBlocks);
    },

    removeMSAN(MSAN) {
      const cidrBlocks = this.config?.masterAuthorizedNetworks?.cidrBlocks.slice() ?? [];

      cidrBlocks.removeObject(MSAN);

      set(this, 'config.masterAuthorizedNetworks.cidrBlocks', cidrBlocks);
    },
  },

  clusterLocationChanged: observer('locationType', function() {
    const { locationType } = this;

    if (locationType === 'regional') {
      setProperties(this, {
        'config.zone':      null,
        'config.locations': [],
      });
    } else {
      set(this, 'config.region', null);
    }
  }),

  clusterSecondaryRangeNameChanged: observer('config.ipAllocationPolicy.clusterSecondaryRangeName', 'secondaryIpRangeContent.[]', function() {
    if (this.isDestroyed || this.isDestroying || this.saving) {
      return;
    }

    const clusterSecondaryRangeName = get(this, 'config.ipAllocationPolicy.clusterSecondaryRangeName');
    const secondaryIpRangeContent = get(this, 'secondaryIpRangeContent') || [];
    const rangeMatch = secondaryIpRangeContent.findBy('value', clusterSecondaryRangeName);

    if (isEmpty(rangeMatch)) {
      if (!(isEmpty(get(this, 'config.ipAllocationPolicy.clusterIpv4CidrBlock')))) {
        set(this, 'config.ipAllocationPolicy.clusterIpv4CidrBlock', null);
      }
    } else {
      set(this, 'config.ipAllocationPolicy.clusterIpv4CidrBlock', rangeMatch.ipCidrRange);
    }
  }),

  enablePrivateNodes: observer('config.privateClusterConfig.enablePrivateNodes', 'config.ipAllocationPolicy.useIpAliases', function() {
    if (this.isDestroyed || this.isDestroying || this.saving) {
      return;
    }

    const { config } = this;
    const { privateClusterConfig: { enablePrivateNodes = false }, } = config ?? {};

    if (enablePrivateNodes) {
      setProperties(config, {
        'ipAllocationPolicy.useIpAliases':  true,
        'masterAuthorizedNetworks.enabled': true,
      });
    }
  }),

  networkChange: observer('config.network', 'subNetworkContent.[]', function() {
    if (this.isDestroyed || this.isDestroying || this.saving) {
      return;
    }

    const subNetworkContent = get(this, 'subNetworkContent') || []

    if (subNetworkContent.length >= 1) {
      const firstNonNullSubnetMatch = subNetworkContent.find((sn) => !isEmpty(sn.value));

      setProperties(this, {
        'config.subnetwork':                           firstNonNullSubnetMatch?.value || '',
        'config.ipAllocationPolicy.createSubnetwork':  false,
        'config.ipAllocationPolicy.subnetworkName':    null,
        'config.ipAllocationPolicy.nodeIpv4CidrBlock': null,
      });
    } else {
      setProperties(this, {
        'config.subnetwork':                                    '',
        'config.ipAllocationPolicy.createSubnetwork':           true,
        'config.ipAllocationPolicy.clusterSecondaryRangeName':  null,
        'config.ipAllocationPolicy.servicesSecondaryRangeName': null,
      });
    }
  }),

  servicesSecondaryRangeNameChanged: observer('config.ipAllocationPolicy.servicesSecondaryRangeName', 'secondaryIpRangeContent.[]', function() {
    if (this.isDestroyed || this.isDestroying || this.saving) {
      return;
    }

    const servicesSecondaryRangeName = get(this, 'config.ipAllocationPolicy.servicesSecondaryRangeName');
    const secondaryIpRangeContent = get(this, 'secondaryIpRangeContent') || [];
    const rangeMatch = secondaryIpRangeContent.findBy('value', servicesSecondaryRangeName);

    if (isEmpty(rangeMatch)) {
      if (!isEmpty(get(this, 'config.ipAllocationPolicy.servicesIpv4CidrBlock'))) {
        set(this, 'config.ipAllocationPolicy.servicesIpv4CidrBlock', null);
      }
    } else {
      set(this, 'config.ipAllocationPolicy.servicesIpv4CidrBlock', rangeMatch.ipCidrRange);
    }
  }),

  secondaryIpRangeContentChange: observer('secondaryIpRangeContent.[]', 'config.ipAllocationPolicy.useIpAliases', 'config.{network,subnetwork}', function() {
    if (this.isDestroyed || this.isDestroying || this.saving) {
      return;
    }

    const secondaryIpRangeContent = get(this, 'secondaryIpRangeContent') || []

    if (secondaryIpRangeContent.length === 0) {
      setProperties(this, {
        'config.ipAllocationPolicy.createSubnetwork':           true,
        'config.ipAllocationPolicy.clusterSecondaryRangeName':  null,
        'config.ipAllocationPolicy.servicesSecondaryRangeName': null,
      });
    }
  }),

  subnetworkChange: observer('config.subnetwork', function() {
    if (this.isDestroyed || this.isDestroying || this.saving) {
      return;
    }

    const { config: { subnetwork } } = this;

    if (isEmpty(subnetwork)) {
      setProperties(this, {
        'config.ipAllocationPolicy.createSubnetwork':           true,
        'config.ipAllocationPolicy.clusterSecondaryRangeName':  null,
        'config.ipAllocationPolicy.servicesSecondaryRangeName': null,
      });
    } else {
      setProperties(this, {
        'config.ipAllocationPolicy.createSubnetwork':  false,
        'config.ipAllocationPolicy.subnetworkName':    null,
        'config.ipAllocationPolicy.nodeIpv4CidrBlock': null,
      });
    }
  }),

  useIpAliasesChanged: observer('config.ipAllocationPolicy.useIpAliases', function() {
    if (this.isDestroyed || this.isDestroying || this.saving) {
      return;
    }

    const useIpAliases = get(this, 'config.ipAllocationPolicy.useIpAliases');

    if (useIpAliases) {
      if (!isEmpty(this.config.subnetwork)) {
        set(this, 'config.ipPolicyCreateSubnetwork', false);
      }
    } else {
      setProperties(this, {
        'config.ipAllocationPolicy.clusterSecondaryRangeName':  null,
        'config.ipAllocationPolicy.servicesSecondaryRangeName': null,
      });
    }
  }),

  postSaveChanged: observer('isPostSave', function() {
    const {
      isNew,
      isPostSave,
      config: { privateClusterConfig: { enablePrivateNodes } },
      importedClusterIsPending,
    } = this;

    if ((enablePrivateNodes || importedClusterIsPending) && isPostSave) {
      if (isNew) {
        set(this, 'step', 5);
      } else {
        this.close();
      }
    } else {
      this.close();
    }
  }),

  importedClusterIsPending: computed('clusterIsPending', 'model.originalCluster', function() {
    const { clusterIsPending } = this;
    const originalCluster = get(this, 'model.originalCluster');
    const ourClusterSpec = get(( originalCluster ?? {} ), 'gkeConfig');
    const upstreamSpec = get(( originalCluster ?? {} ), 'gkeStatus.upstreamSpec');

    return clusterIsPending && get(ourClusterSpec, 'imported') && !isEmpty(upstreamSpec);
  }),

  clusterIsPending: computed('clusterState', function() {
    const { clusterState } = this;

    return ['pending', 'provisioning', 'waiting'].includes(clusterState);
  }),


  cloudCredentials: computed('model.cloudCredentials', function() {
    const { model: { cloudCredentials } } = this;

    return cloudCredentials.filter((cc) => Object.prototype.hasOwnProperty.call(cc, 'googlecredentialConfig'));
  }),

  disableSecondaryRangeNames: computed('config.ipAllocationPolicy.{createSubnetwork,useIpAliases}', function() {
    const ipAllocationPolicy = get(this, 'config.ipAllocationPolicy');
    const { createSubnetwork = false, useIpAliases = false } = ipAllocationPolicy ?? {
      createSubnetwork: false,
      useIpAliases:     false
    };

    if (!useIpAliases && !createSubnetwork) {
      return true;
    }

    if (useIpAliases && !createSubnetwork) {
      return false;
    }

    return true;
  }),

  locationContent: computed('config.zone', 'zoneChoices', function() {
    const zone = get(this, 'config.zone')

    if ( !zone ) {
      return [];
    }
    const arr = zone.split('-')
    const locationName = `${ arr[0] }-${ arr[1] }`
    const zoneChoices = get(this, 'zoneChoices')

    return zoneChoices.filter((z) => (z.name || '').startsWith(locationName) && z.name !== zone)
  }),

  maintenanceWindowChoice: computed('maintenanceWindowTimes.[]', 'config.maintenanceWindow', function() {
    return get(this, 'maintenanceWindowTimes').findBy('value', get(this, 'config.maintenanceWindow')) || { label: 'Any Time' };
  }),


  networkContent: computed('config.zone', 'networks', 'sharedSubnets', function() {
    const networks = (get(this, 'networks') || []).map((net) => {
      return {
        ...net,
        group:  'VPC',
        shared: false
      };
    });
    const sharedSubnets = (get(this, 'sharedSubnets') || []).map((ssn) => {
      return {
        ...ssn,
        group:  'Shared VPC',
        shared: true,
        name:   ssn?.network,
      };
    })
    const merged = [...networks, ...sharedSubnets];

    return merged;
  }),

  secondaryIpRangeContent: computed('subNetworkContent.[]', 'config.{network,subnetwork}', function() {
    const { subNetworkContent = [], config: { subnetwork } } = this;
    const subnetworkMatch = subNetworkContent.findBy('value', subnetwork);

    if (subnetworkMatch) {
      const { secondaryIpRanges = [] } = subnetworkMatch;

      return secondaryIpRanges.map((s) => {
        return {
          label:       `${ s.rangeName }(${ s.ipCidrRange })`,
          value:       s.rangeName,
          ipCidrRange: s.ipCidrRange,
        }
      });
    }

    return [];
  }),

  subNetworkContent: computed('subNetworks.[]', 'sharedSubnets.[]', 'config.network', 'config.zone', function() {
    const {
      config: { network: networkName },
      networkContent,
      subNetworks = [],
      sharedSubnets = [],
    } = this;
    const networkMatch = networkContent.findBy('name', networkName);
    let filteredSubnets = [];
    let mappedSubnets = [];
    let out = [];

    if (!isEmpty(networkMatch) && networkMatch.shared) {
      const sharedVpcs = sharedSubnets.filterBy('network', networkName);

      mappedSubnets = sharedVpcs.map((sVpc) => {
        const networkDisplayName = sVpc.network;

        return {
          label:             `${ sVpc.subnetwork } (${ sVpc.ipCidrRange })`,
          value:             sVpc.subnetwork,
          secondaryIpRanges: sVpc.secondaryIpRanges,
          networkDisplayName
        }
      });

      out = [...mappedSubnets];
    } else {
      filteredSubnets = (subNetworks || []).filter((s) => {
        const network            = networkContent.findBy('selfLink', s.network);
        const networkDisplayName = network.name;

        if (networkDisplayName === networkName) {
          return true
        }
      });
      mappedSubnets = filteredSubnets.map((o) => {
        const network            = networkContent.findBy('selfLink', o.network);
        const networkDisplayName = network.name;

        return {
          label:             `${ o.name }(${ o.ipCidrRange })`,
          value:             o.name,
          secondaryIpRanges: o.secondaryIpRanges,
          networkDisplayName
        }
      });

      const defaultSubnetAry = [{
        label: this.intl.t('clusterNew.googlegke.ipPolicyCreateSubnetwork.autoLabel'),
        value: '',
      }];

      out = [...defaultSubnetAry, ...mappedSubnets];
    }

    return out;
  }),

  selectedCloudCredential: computed('config.googleCredentialSecret', function() {
    const {
      model: { cloudCredentials = [] },
      config: { googleCredentialSecret }
    } = this;

    if (isEmpty(cloudCredentials) && isEmpty(googleCredentialSecret)) {
      return null;
    } else {
      return cloudCredentials.findBy('id', googleCredentialSecret.includes('cattle-global-data:') ? googleCredentialSecret : `cattle-global-data:${ googleCredentialSecret }`);
    }
  }),

  versionChoices: computed('versions.validMasterVersions.[]', 'config.kubernetesVersion', function() {
    const {
      versions: { validMasterVersions = [] },
      config:   { kubernetesVersion },
      mode,
    } = this;

    return this.serivceVersions.parseCloudProviderVersionChoices(validMasterVersions, kubernetesVersion, mode);
  }),

  zoneChoices: computed('zones.[]', function() {
    let out = (get(this, 'zones') || []).slice();

    out.forEach((obj) => {
      set(obj, 'sortName', sortableNumericSuffix(obj.name));
      set(obj, 'displayName', `${ obj.name  } (${  obj.description  })`);
      set(obj, 'disabled', obj.status.toLowerCase() !== 'up');
    });

    return out.sortBy('sortName')
  }),

  defaultConfig() {
    const neu = { ...DEFAULT_GKE_CONFIG };
    const neuNp = { ...DEFAULT_GKE_NODE_POOL_CONFIG };

    set(neu, 'nodePools', [neuNp]);

    return neu;
  },

  validatePrivateConfig() {
    const config = get(this, 'config') || {}
    const { privateClusterConfig } = config;

    if (isEmpty(privateClusterConfig)) {
      return true;
    }

    if (privateClusterConfig?.enablePrivateNodes && isEmpty(privateClusterConfig?.masterIpv4CidrBlock)) {
      this.send('errorHandler', this.intl.t('clusterNew.googlegke.masterIpv4CidrBlock.error'));

      return false;
    }

    return true;
  },

  willSave() {
    this.validateNodePools();
    this.validatePrivateConfig();

    if (!isEmpty(this.errors)) {
      return false;
    }

    const config = get(this, 'config') || {}

    const locationType = get(this, 'locationType');

    if ( locationType === this.google.defaultZoneType ) {
      set(config, 'region', null);
    } else {
      set(config, 'zone', null);
    }

    if (get(this, 'config.useIpAliases')) {
      set(config, 'clusterIpv4Cidr', null);
    }

    if (!get(config, 'masterAuthorizedNetworks.enabled')) {
      delete config.masterAuthorizedNetworks.cidrBlocks
    }

    const locationContent = get(this, 'locationContent')
    const locations = locationContent.filter((l) => l.checked).map((l) => l.name)

    if (this.locationType === 'zonal') {
      if (locations.length > 0) {
        locations.push(get(config, 'zone'))
        set(config, 'locations', locations)
      }
    }

    return this._super(...arguments);
  },

  validateNodePools() {
    const nodePools = get(this, 'primaryResource.gkeConfig.nodePools');
    const errors = [];

    if (!isEmpty(nodePools)) {
      const nodePoolErrors = [];

      nodePools.forEach((np) => {
        const npErr = np.validationErrors();

        nodePoolErrors.push(npErr)
      });

      if (!isEmpty(nodePoolErrors)) {
        errors.pushObjects(nodePoolErrors.flat());
      }
    }

    set(this, 'errors', errors);

    return errors.length >= 1 ? true : null;
  },

  syncUpstreamConfig() {
    const originalCluster = get(this, 'model.originalCluster').clone();
    const ourClusterSpec = get(originalCluster, 'gkeConfig');
    const upstreamSpec = get(originalCluster, 'gkeStatus.upstreamSpec');

    if (!isEmpty(upstreamSpec)) {
      Object.keys(upstreamSpec).forEach((k) => {
        if (isEmpty(get(ourClusterSpec, k)) && !isEmpty(get(upstreamSpec, k))) {
          set(this, `config.${ k }`, get(upstreamSpec, k));
        }
      });
    }
  },
});
