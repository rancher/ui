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
import Semver from 'semver';

export default Component.extend(ClusterDriver, {
  google:          service(),
  intl:            service(),
  serviceVersions: service('version-choices'),
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
  showLogMonServiceWarning: false,
  clusterReleaseChannel:    null,
  originalSecret:           null,

  defalutNodePoolConfig: DEFAULT_GKE_NODE_POOL_CONFIG,
  defaultGkeConfig:      DEFAULT_GKE_CONFIG,

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
      if ( this.editing && this.importedClusterIsPending || (this.clusterIsPending && config?.privateClusterConfig?.enablePrivateEndpoint) ) {
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

    let cur = config?.googleCredentialSecret;

    if ( cur && !cur.startsWith('cattle-global-data:') ) {
      cur = `cattle-global-data:${ cur }`;
    }

    set(this, 'originalSecret', cur);
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
      const config = get(this, `primaryResource.gkeConfig`);
      const kubernetesVersion = get(config, 'kubernetesVersion');
      let nodePools = (get(config, 'nodePools') || []).slice();
      const npConfig = JSON.parse(JSON.stringify(this.defalutNodePoolConfig));

      if (!isArray(nodePools)) {
        nodePools = [];
      }

      const nodePool = this.globalStore.createRecord(npConfig);

      setProperties(nodePool, {
        version: kubernetesVersion,
        isNew:   true,
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

    loadZones(cb = () => {}) {
      set(this, 'errors', []);

      return all([
        this.google.fetchZones(this.cluster, this.saved),
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
      const promises = [
        this.google.fetchVersions(this.cluster, this.saved),
        this.google.fetchMachineTypes(this.cluster, this.saved),
        this.google.fetchNetworks(this.cluster, this.saved),
        this.google.fetchSubnetworks(this.cluster, get(this, 'locationType'), this.saved),
        this.google.fetchSharedSubnets(this.cluster, this.saved),
        this.google.fetchServiceAccounts(this.cluster, this.saved),
      ];

      if (this.editing) {
        promises.push(this.google.fetchClusters(this.cluster, this.saved));
      }

      return all(promises).then((resp) => {
        const [versions, machineTypes, networks, subNetworks, sharedSubnets, servicesAccounts, allClusters = []] = resp;

        setProperties(this, {
          step: 3,
          subNetworks,
          machineTypes,
          networks,
          servicesAccounts,
          sharedSubnets,
          versions,
        });

        if ((allClusters || []).length > 0) {
          const myCluster = allClusters.findBy('name', config?.clusterName);
          const releaseChannel = myCluster?.releaseChannel?.channel;

          if (!isEmpty(releaseChannel)) {
            set(this, 'clusterReleaseChannel', releaseChannel);
          }
        }

        // const filter = servicesAccounts.filter((o) => o.displayName === 'Compute Engine default service account')

        if (get(this, 'mode') === 'new') {
          // set(this, 'config.serviceAccount', filter?.firstObject && filter.firstObject.uniqueId)
          const defaultNet = networks.findBy('name', 'default');

          if (!isEmpty(defaultNet)) {
            set(this, 'config.network', defaultNet?.name);
          } else {
            set(this, 'config.network', networks?.firstObject && networks.firstObject.name);
          }
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

  networkPolicyEnabledChanged: observer('config.networkPolicyEnabled', function() {
    if (get(this, 'isNew') && get(this, 'config.networkPolicyEnabled')) {
      set(this, 'config.clusterAddons.networkPolicyConfig', true);
    }
  }),

  networkPolicyChanged: observer('cluster.enableNetworkPolicy', function() {
    const { cluster } = this;

    if (cluster?.enableNetworkPolicy) {
      setProperties(this, {
        'config.networkPolicyEnabled':              true,
        'config.clusterAddons.networkPolicyConfig': true,
      });
    }
  }),

  loggingServiceChanged: observer('config.loggingService', 'editing', function() {
    const { config, editing } = this;
    const loggingService = config?.loggingService || null;
    const monitoringService = config?.monitoringService || null;

    if (!editing) {
      return;
    }

    if (loggingService) {
      if (loggingService === 'none' && monitoringService !== 'none' || !monitoringService) {
        set(this, 'showLogMonServiceWarning', true);
      } else if (loggingService === 'logging.googleapis.com/kubernetes' && monitoringService === 'none') {
        set(this, 'showLogMonServiceWarning', true);
      } else {
        set(this, 'showLogMonServiceWarning', false);
      }
    }
  }),

  monitoringServiceChanged: observer('config.monitoringService', 'editing', function() {
    const { config, editing } = this;
    const loggingService = config?.loggingService || null;
    const monitoringService = config?.monitoringService || null;

    if (!editing) {
      return;
    }

    if (monitoringService) {
      if (monitoringService === 'none' && loggingService !== 'none' || !loggingService) {
        set(this, 'showLogMonServiceWarning', true);
      } else if (monitoringService === 'monitoring.googleapis.com/kubernetes' && loggingService === 'none') {
        set(this, 'showLogMonServiceWarning', true);
      } else {
        set(this, 'showLogMonServiceWarning', false);
      }
    }
  }),

  clusterLocationChanged: observer('locationType', function() {
    const { locationType } = this;

    if (locationType === 'regional') {
      setProperties(this, {
        'config.zone':      null,
        'config.locations': ['us-central1-c'],
        'config.region':    'us-central1'
      });
    } else {
      setProperties(this, {
        'config.region':    null,
        'config.zone':      'us-central1-c',
        'config.locations': [],
      });
    }

    this.send('loadZones');
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

    if (config?.privateClusterConfig?.enablePrivateNodes) {
      setProperties(config, {
        'ipAllocationPolicy.useIpAliases':  true,
        'masterAuthorizedNetworks.enabled': true,
      });
    }
  }),

  networkChange: observer('config.network', 'subNetworkContent.[]', 'config.ipAllocationPolicy.useIpAliases', function() {
    if (this.isDestroyed || this.isDestroying || this.saving) {
      return;
    }

    const subNetworkContent = get(this, 'subNetworkContent') || []

    if (subNetworkContent.length >= 1) {
      const firstNonNullSubnetMatch = subNetworkContent.find((sn) => !isEmpty(sn.value));

      if (!isEmpty(firstNonNullSubnetMatch?.value)) {
        setProperties(this, {
          'config.subnetwork':                           firstNonNullSubnetMatch.value,
          'config.ipAllocationPolicy.createSubnetwork':  false,
        });
      } else {
        if (this.config?.ipAllocationPolicy?.useIpAliases) {
          setProperties(this, {
            'config.subnetwork':                           '',
            'config.ipAllocationPolicy.createSubnetwork':  true,
          });
        } else {
          set(this, 'config.ipAllocationPolicy.createSubnetwork', false);
        }
      }

      setProperties(this, {
        'config.ipAllocationPolicy.subnetworkName':    null,
        'config.ipAllocationPolicy.nodeIpv4CidrBlock': null,
      });
    } else {
      setProperties(this, {
        'config.subnetwork':                                    '',
        'config.ipAllocationPolicy.clusterSecondaryRangeName':  null,
        'config.ipAllocationPolicy.servicesSecondaryRangeName': null,
      });

      if (this.config?.ipAllocationPolicy?.useIpAliases) {
        set(this, 'config.ipAllocationPolicy.createSubnetwork', true);
      } else {
        set(this, 'config.ipAllocationPolicy.createSubnetwork', false);
      }
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
        'config.ipAllocationPolicy.clusterSecondaryRangeName':  null,
        'config.ipAllocationPolicy.servicesSecondaryRangeName': null,
      });
    }
  }),

  subnetworkChange: observer('config.subnetwork', 'config.ipAllocationPolicy.useIpAliases', function() {
    if (this.isDestroyed || this.isDestroying || this.saving) {
      return;
    }

    const { config: { subnetwork } } = this;

    if (isEmpty(subnetwork)) {
      setProperties(this, {
        'config.ipAllocationPolicy.clusterSecondaryRangeName':  null,
        'config.ipAllocationPolicy.servicesSecondaryRangeName': null,
      });

      if (this.config?.ipAllocationPolicy?.useIpAliases) {
        set(this, 'config.ipAllocationPolicy.createSubnetwork', true);
      } else {
        set(this, 'config.ipAllocationPolicy.createSubnetwork', false);
      }
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

  showPolicyConfigWarning: computed('config.clusterAddons.networkPolicyConfig', 'editing', 'model.originalCluster.gkeStatus.upstreamSpec', 'upstreamSpec.clusterAddons.networkPolicyConfig', function() {
    const upstreamSpec = get(this, 'model.originalCluster.gkeStatus.upstreamSpec');

    if (this.editing && !isEmpty(upstreamSpec)) {
      const ogNetworkPolicyConfig = get(this, 'upstreamSpec.clusterAddons.networkPolicyConfig') ?? false;
      const currentNetworkPolicyConfig = get(this, 'config.clusterAddons.networkPolicyConfig') ?? false;

      // if user is turning off show warning
      if (ogNetworkPolicyConfig && !currentNetworkPolicyConfig) {
        return true;
      }
    }

    return false;
  }),

  showPolicyEnabledWarning: computed('config.networkPolicyEnabled', 'editing', 'model.originalCluster.gkeStatus.upstreamSpec.networkPolicyEnabled', function() {
    const upstreamSpec = get(this, 'model.originalCluster.gkeStatus.upstreamSpec');

    if (this.editing && !isEmpty(upstreamSpec)) {
      const ogNetworkPolicyEnabled = get(this, 'model.originalCluster.gkeStatus.upstreamSpec.networkPolicyEnabled') ?? false;
      const currentNetworkPolicyEnabled = get(this, 'config.networkPolicyEnabled') ?? false;

      // if user is turning off show warning
      if (ogNetworkPolicyEnabled && !currentNetworkPolicyEnabled) {
        return true;
      }
    }

    return false;
  }),

  shouldDisableNetworkPolicyEnabled: computed('config.clusterAddons.networkPolicyConfig', 'config.networkPolicyEnabled', 'editing', 'isNewOrEditable', 'model.originalCluster.gkeStatus.upstreamSpec.clusterAddons.networkPolicyConfig', 'model.originalCluster.gkeStatus.upstreamSpec.networkPolicyEnabled', function() {
    const currentNetworkPolicyConfig = get(this, 'config.clusterAddons.networkPolicyConfig') ?? false;
    const ogNetworkPolicyConfig = get(this, 'model.originalCluster.gkeStatus.upstreamSpec.clusterAddons.networkPolicyConfig') ?? false;
    const ogNetworkPolicyEnabled = get(this, 'model.originalCluster.gkeStatus.upstreamSpec.networkPolicyEnabled') ?? false;

    if (this.isNewOrEditable) {
      return false;
    } else {
      if (this.editing) {
        if (!ogNetworkPolicyConfig && !ogNetworkPolicyEnabled) {
          return true;
        } else if (!currentNetworkPolicyConfig) {
          return true;
        }
      }
    }

    return false;
  }),

  shouldDisableNetworkPolicyConfig: computed('config.networkPolicyEnabled', 'editing', 'isNewOrEditable', 'model.originalCluster.gkeStatus.upstreamSpec.clusterAddons.networkPolicyConfig', 'model.originalCluster.gkeStatus.upstreamSpec.networkPolicyEnabled', function() {
    const currentNetworkPolicyEnabled = get(this, 'config.networkPolicyEnabled') ?? false;
    const ogNetworkPolicyEnabled = get(this, 'model.originalCluster.gkeStatus.upstreamSpec.networkPolicyEnabled') ?? false;
    const ogNetworkPolicyConfig = get(this, 'model.originalCluster.gkeStatus.upstreamSpec.clusterAddons.networkPolicyConfig') ?? false;

    if (this.isNewOrEditable) {
      return false;
    } else {
      if (this.editing) {
        if (currentNetworkPolicyEnabled && !ogNetworkPolicyEnabled ) {
          return true;
        } else if (ogNetworkPolicyEnabled && ogNetworkPolicyConfig)  {
          return true;
        }
      }
    }

    return false;
  }),

  hasProvisioned: computed('model.cluster', function() {
    const cluster = get(this, 'model.cluster');
    const { state = '', isError = false } = cluster;
    let clusterHasProvisioned = true;

    if (isError && state === 'provisioning') {
      if (isEmpty(cluster?.gkeStatus?.upstreamSpec)) {
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


  cloudCredentials: computed('globalStore', 'model.cloudCredentials', 'originalSecret', function() {
    const { model: { cloudCredentials } } = this;

    const out = cloudCredentials.filter((cc) => Object.prototype.hasOwnProperty.call(cc, 'googlecredentialConfig'));

    if ( this.originalSecret && !out.find((x) => x.id === this.originalSecret ) ) {
      const obj = this.globalStore.createRecord({
        name:                   `${ this.originalSecret.replace(/^cattle-global-data:/, '') } (current)`,
        id:                     this.originalSecret,
        type:                   'cloudCredential',
        googlecredentialConfig: {},
      });

      out.push(obj);
    }

    return out;
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

  locationContent: computed('config.{region,zone}', 'zoneChoices', 'regionChoices', function() {
    const { region, zone } = this.config;
    const { locationType, zoneChoices } = this;
    let locationName = null;

    if (locationType === 'zonal') {
      const arr = zone.split('-')

      locationName = `${ arr[0] }-${ arr[1] }`;
    } else {
      locationName = region;
    }

    return zoneChoices.filter((z) => (z.name || '').startsWith(locationName) && z.name !== zone);
  }),

  maintenanceWindowChoice: computed('maintenanceWindowTimes.[]', 'config.maintenanceWindow', function() {
    return get(this, 'maintenanceWindowTimes').findBy('value', get(this, 'config.maintenanceWindow')) || { label: 'Any Time' };
  }),


  networkContent: computed('config.zone', 'networks.[]', 'sharedSubnets.[]', 'subNetworks.[]', function() {
    const subnets = get(this, 'subNetworks');
    const networks = (get(this, 'networks') || []).map((net) => {
      const matchedSubnets = ( subnets || [] ).filterBy('network', net.selfLink);

      return {
        ...net,
        group:  'VPC',
        shared: false,
        label:  matchedSubnets.length > 0 ? `${ net.name } (subnets available)` : net.name,
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

  subNetworkContent: computed('subNetworks.[]', 'sharedSubnets.[]', 'config.network', 'config.zone', 'config.ipAllocationPolicy.useIpAliases', function() {
    const {
      config: { network: networkName, ipAllocationPolicy: { useIpAliases = false } },
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

      if (useIpAliases) {
        const defaultSubnetAry = [{
          label: this.intl.t('clusterNew.googlegke.ipPolicyCreateSubnetwork.autoLabel'),
          value: '',
        }];

        out = [...defaultSubnetAry, ...mappedSubnets];
      } else {
        out = [...mappedSubnets];
      }
    }

    return out;
  }),

  selectedCloudCredential: computed('cloudCredentials.@each.id', 'config.googleCredentialSecret', function() {
    const cur = this.config.googleCredentialSecret;
    const cloudCredentials = this.cloudCredentials;

    if (isEmpty(cloudCredentials) && isEmpty(cur)) {
      return null;
    } else {
      return cloudCredentials.findBy('id', cur.includes('cattle-global-data:') ? cur : `cattle-global-data:${ cur }`);
    }
  }),

  versionChoices: computed('clusterReleaseChannel', 'editing', 'versions.{validMasterVersions,channels}', function() {
    const {
      versions,
      config,
      mode,
    } = this;
    let validMasterVersions = versions?.validMasterVersions || [];
    let { kubernetesVersion: initialVersion } = config;

    if (!isEmpty(this.clusterReleaseChannel)) {
      const matchedChannel = (versions?.channels || []).findBy('channel', this.clusterReleaseChannel);

      if (matchedChannel?.validVersions) {
        validMasterVersions = matchedChannel?.validVersions;
      }
    }

    if (isEmpty(initialVersion)) {
      initialVersion = validMasterVersions[0];
    }

    if (this.editing && !validMasterVersions.includes(initialVersion)) {
      validMasterVersions.unshift(initialVersion);
    }

    Semver.rsort(validMasterVersions, { includePrerelease: true });

    const versionChoices = this.serviceVersions.parseCloudProviderVersionChoicesV2(validMasterVersions.slice(), initialVersion, mode);

    if (this.editing) {
      try {
        const initialSem = Semver.parse(initialVersion, { includePrerelease: true });
        const initalMinorVersion = initialSem.minor;

        versionChoices.forEach((vc) => {
          const choiceSemver = Semver.parse(vc.value, { includePrerelease: true });
          const vcMinorV = choiceSemver?.minor;
          const diff     = vcMinorV - initalMinorVersion;

          if (diff > 1) {
            setProperties(vc, {
              disabled: true,
              label:    `${ vc.label } ${ this.intl.t('formVersions.minorWarning') }`,
            });
          }
        });
      } catch (_error) {}
    }

    return versionChoices;
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
    const neu = JSON.parse(JSON.stringify(this.defaultGkeConfig));
    const defNpConfig = JSON.parse(JSON.stringify(this.defalutNodePoolConfig));
    const neuNp = this.globalStore.createRecord(defNpConfig);

    set(neuNp, 'isNew', true); // for node pool row component
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

    if (get(this, 'config.ipAllocationPolicy.useIpAliases')) {
      set(config, 'ipAllocationPolicy.clusterIpv4Cidr', '');
    } else {
      if (isEmpty(get(config, 'subnetwork'))) {
        this.send('errorHandler', this.intl.t('clusterNew.googlegke.useIpAliases.error'));

        return false;
      }
    }

    if (!get(config, 'masterAuthorizedNetworks.enabled')) {
      delete config.masterAuthorizedNetworks.cidrBlocks
    }

    const locationType = get(this, 'locationType');

    if ( locationType === this.google.defaultZoneType ) {
      set(config, 'region', null);
    } else {
      set(config, 'zone', null);
    }

    const locationContent = get(this, 'locationContent')
    const locations = locationContent.filter((l) => l.checked).map((l) => l.name)

    if (locations.length > 0) {
      if (this.locationType === 'zonal') {
        locations.push(get(config, 'zone'))
      }

      set(config, 'locations', locations)
    } else {
      set(config, 'locations', []);
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
