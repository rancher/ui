import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import layout from './template';

import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { sortableNumericSuffix } from 'shared/utils/util';
import { reject, all } from 'rsvp';
import { inject as service } from '@ember/service';
import { equal } from '@ember/object/computed'

const times = [
  {
    value: null,
    label: 'Any Time',
  },
  {
    value: '00:00',
    label: '12:00AM',
  },
  {
    value: '03:00',
    label: '3:00AM',
  },
  {
    value: '06:00',
    label: '6:00AM',
  },
  {
    value: '09:00',
    label: '9:00AM',
  },
  {
    value: '12:00',
    label: '12:00PM',
  },
  {
    value: '15:00',
    label: '3:00PM',
  },
  {
    value: '19:00',
    label: '7:00PM',
  },
  {
    value: '21:00',
    label: '9:00PM',
  },
]

const imageType = [
  {
    label: 'clusterNew.googlegke.imageType.UBUNTU',
    value: 'UBUNTU',
  },
  {
    label: 'clusterNew.googlegke.imageType.COS',
    value: 'COS'
  },
]

const diskType = [
  {
    label: 'clusterNew.googlegke.diskType.pd-standard',
    value: 'pd-standard',
  },
  {
    label: 'clusterNew.googlegke.diskType.pd-ssd',
    value: 'pd-ssd',
  }
]

const DEFAULT_AUTH_SCOPES = ['devstorage.read_only', 'logging.write', 'monitoring', 'servicecontrol', 'service.management.readonly', 'trace.append']


export default Component.extend(ClusterDriver, {
  intl: service(),

  layout,
  configField:            'googleKubernetesEngineConfig',

  step:                   1,
  zones:                  null,
  versions:               null,
  machineTypes:           null,

  initialMasterVersion:   null,
  maintenanceWindowTimes: times,
  eipIdContent:           [],
  imageTypeContent:       imageType,
  clusterAdvanced:        false,
  nodeAdvanced:           false,
  diskTypeContent:        diskType,
  scopeConfig:            {},
  hideNewField:           false,

  isNew:                  equal('mode', 'new'),
  editing:                equal('mode', 'edit'),

  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.googleKubernetesEngineConfig');

    if ( !config ) {
      config = get(this, 'globalStore').createRecord({
        type:               'googleKubernetesEngineConfig',
        diskSizeGb:         100,
        enableAlphaFeature: false,
        nodeCount:          3,
        machineType:        'n1-standard-2',
        zone:               'us-central1-f',
        clusterIpv4Cidr:    '',
        minNodeCount:       1,
        maxNodeCount:       5,
        imageType:          'UBUNTU',
        diskType:           'pd-standard',
        taints:             [],
      });

      setProperties(this, {
        'cluster.googleKubernetesEngineConfig': config,
        oauthScopesSelection:                   'default',
        scopeConfig:                            {
          userInfo:                 'none',
          computeEngine:            'none',
          storage:                  'devstorage.read_only',
          taskQueue:                'none',
          bigQuery:                 'none',
          cloudSQL:                 'none',
          cloudDatastore:           'none',
          stackdriverLoggingAPI:    'logging.write',
          stackdriverMonitoringAPI: 'monitoring',
          cloudPlatform:            'none',
          bigtableData:             'none',
          bigtableAdmin:            'none',
          cloudPub:                 'none',
          serviceControl:           'none',
          serviceManagement:        'service.management.readonly',
          stackdriverTrace:         'trace.append',
          cloudSourceRepositories:  'none',
          cloudDebugger:            'none'
        },
        resourceLabels: [],
        labels:         [],
        taints:         [],
      })
    } else {
      const {
        resourceLabels = [], labels = [], taints = [], imageType
      } = config

      if (!imageType) {
        set(this, 'hideNewField', true)
      }

      let map = {}

      if (resourceLabels) {
        resourceLabels.map((t = '') => {
          const split = t.split('=')

          set(map, split[0], split[1])
        })
        set(this, 'resourceLabels', map)
      }

      if (labels) {
        labels.map((t = '') => {
          const split = t.split('=')

          set(map, split[0], split[1])
        })
        set(this, 'labels', map)
      }

      if (taints) {
        let _taints = taints.map((t = '') => {
          const splitEffect = t.split(':')
          const splitLabel = (splitEffect[1] || '').split('=')

          return {
            effect: splitEffect[0],
            key:    splitLabel[0],
            value:  splitLabel[1],
          }
        })

        set(this, 'taints', _taints)
      } else {
        set(this, 'taints', [])
      }
    }

    set(this, 'initialMasterVersion', get(this, 'config.masterVersion'));
  },

  actions: {
    clickNext() {
      this.$('BUTTON[type="submit"]').click();
    },

    checkServiceAccount(cb) {
      set(this, 'errors', []);

      return all([
        this.fetchZones(),
        this.fetchVersions(),
        this.fetchMachineTypes(),
        this.fetchNetworks(),
        this.fetchSubnetworks(),
        this.fetchServiceAccounts(),
      ]).then(() => {
        set(this, 'step', 2);
        cb(true);
      }).catch(() => {
        cb(false);
      });
    },

    setLabels(section) {
      const out = []

      for (let key in section) {
        out.pushObject(`${ key }=${ section[key] }`)
      }

      set(this, 'config.resourceLabels', out);
    },

    setNodeLabels(section) {
      const out = []

      for (let key in section) {
        out.pushObject(`${ key }=${ section[key] }`)
      }

      set(this, 'config.labels', out);
    },

    updateNameservers(nameservers) {
      set(this, 'config.masterAuthorizedNetworkCidrBlocks', nameservers);
    },

    setTaints(value) {
      set(this, 'config.taints', value);
    },
  },

  credentialChanged: observer('config.credential', function() {
    const str = get(this, 'config.credential');

    if ( str ) {
      try {
        const obj = JSON.parse(str);
        // Note: this is a Google project id, not ours.
        const projectId = obj.project_id;

        set(this, 'config.projectId', projectId);
      } catch (e) {
      }
    }
  }),

  zoneChanged: observer('config.zone', 'zones.[]', function() {
    const zones = get(this, 'zones') || [];
    const currentZone = zones.findBy('name', get(this, 'config.zone'));

    if ( !currentZone || currentZone.status.toLowerCase() !== 'up' ) {
      const newZone = zones.filter((x) => x.name.startsWith('us-')).find((x) => x.status.toLowerCase() === 'up');

      if ( newZone ) {
        set(this, 'config.zone', newZone.name);
      }
    }

    this.fetchVersions();
    this.fetchMachineTypes();
    this.fetchNetworks();
    this.fetchSubnetworks();
    this.fetchServiceAccounts();
  }),

  machineTypeChanged: observer('config.machineTypes', 'machineTypes.[]', function() {
    const types = get(this, 'machineTypes') || [];
    const current = types.findBy('name', get(this, 'config.machineType'));

    if ( !current ) {
      set(this, 'config.machineType', get(types, 'firstObject.name'));
    }
  }),

  versionChanged: observer('config.masterVersion', 'versionChoices.[]', function() {
    const versions = get(this, 'versionChoices') || [];
    const current = get(this, 'config.masterVersion');
    const exists = versions[versions.indexOf(current)];

    if ( !exists ) {
      set(this, 'config.masterVersion', versions[0]);
    }
  }),

  networkChange: observer('config.network', 'subNetworkContent.[]', function() {
    const subNetworkContent = get(this, 'subNetworkContent') || []

    if (subNetworkContent.length > 0) {
      set(this, 'config.subNetwork', subNetworkContent[0] && subNetworkContent[0].value)
      const secondaryIpRangeContent = get(this, 'secondaryIpRangeContent') || []

      if (secondaryIpRangeContent.length > 0) {
        const value = secondaryIpRangeContent[0] && secondaryIpRangeContent[0].value

        setProperties(this, {
          'config.ipPolicyClusterSecondaryRangeName':  value,
          'config.ipPolicyServicesSecondaryRangeName': value,
        })
      }
    }
  }),

  secondaryIpRangeContentChange: observer('secondaryIpRangeContent.[]', 'config.useIpAliases', function() {
    const secondaryIpRangeContent = get(this, 'secondaryIpRangeContent') || []

    if (secondaryIpRangeContent.length === 0) {
      set(this, 'config.ipPolicyCreateSubnetwork', true)
    }
  }),

  useIpAliasesChange: observer('config.useIpAliases', function() {
    if (!get(this, 'config.useIpAliases')) {
      set(this, 'config.enablePrivateNodes', false)
    }
  }),

  enablePrivateNodesChange: observer('config.enablePrivateNodes', function() {
    const config = get(this, 'config')

    if (!get(config, 'enablePrivateNodes')) {
      setProperties(config, {
        enablePrivateEndpoint: false,
        masterIpv4CidrBlock:   '',
      })
    }
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

  machineChoices: computed('machineTypes.[]', function() {
    let out = (get(this, 'machineTypes') || []).slice();

    out.forEach((obj) => {
      set(obj, 'sortName', sortableNumericSuffix(obj.name));
      set(obj, 'displayName', `${ obj.name  } (${  obj.description  })`);
    });

    return out.sortBy('sortName')
  }),

  editedMachineChoice: computed('machineChoices', 'config', function() {
    return get(this, 'machineChoices').findBy('name', get(this, 'config.machineType'));
  }),

  versionChoices: computed('versions.validMasterVersions.[]', 'config.masterVersion', function() {
    return get(this, 'versions.validMasterVersions');
  }),

  locationContent: computed('config.zone', function() {
    const zone = get(this, 'config.zone')
    const arr = zone.split('-')
    const locationName = `${ arr[0] }-${ arr[1] }`
    const zoneChoices = get(this, 'zoneChoices')

    return zoneChoices.filter((z) => (z.name || '').startsWith(locationName) && z.name !== zone)
  }),

  networkContent: computed('nerworks', function() {
    return get(this, 'networks')
  }),

  subNetworkContent: computed('subNetworks.[]', 'config.network', function() {
    const subNetworks = get(this, 'subNetworks') || []
    const networkName = get(this, 'config.network')

    const out = subNetworks.filter((s) => {
      const { network = '' } = s
      const arr = network.split('/') || []
      const networkDisplayName = arr[arr.length - 1]

      if (networkDisplayName === networkName) {
        return true
      }
    })

    return out.map((o) => {
      return {
        label:             `${ o.name }(${ o.ipCidrRange })`,
        value:             o.name,
        secondaryIpRanges: o.secondaryIpRanges,
      }
    })
  }),

  secondaryIpRangeContent: computed('subNetworkContent.[]', 'config.network', function() {
    const subNetworkContent = get(this, 'subNetworkContent')
    const { secondaryIpRanges = [] } = subNetworkContent

    return secondaryIpRanges.map((s) => {
      return {
        lable: `${ s.rangeName }(${ s.ipCidrRange })`,
        value: s.rangeName,
      }
    })
  }),

  serviceAccountContent: computed('serviceAccounts', function() {
    const serviceAccounts = get(this, 'serviceAccounts')

    return serviceAccounts
  }),

  maintenanceWindowChoice: computed('maintenanceWindowTimes.[]', 'config.maintenanceWindow', function() {
    return get(this, 'maintenanceWindowTimes').findBy('value', get(this, 'config.maintenanceWindow')) || { label: 'Any Time' };
  }),

  fetchZones() {
    return get(this, 'globalStore').rawRequest({
      url:    '/meta/gkeZones',
      method: 'POST',
      data:   {
        credentials: get(this, 'config.credential'),
        projectId:   get(this, 'config.projectId'),
      }
    }).then((xhr) => {
      const out = xhr.body.items;
      const locations = get(this, 'config.locations') || []

      if (locations.length > 0) {
        out.map((o) => {
          if (locations.includes(o.name)) {
            set(o, 'checked', true)
          }
        })
      }
      set(this, 'zones', out);

      return out;
    }).catch((xhr) => {
      set(this, 'errors', [xhr.body.error]);

      return reject();
    });
  },

  fetchVersions() {
    return get(this, 'globalStore').rawRequest({
      url:    '/meta/gkeVersions',
      method: 'POST',
      data:   {
        credentials: get(this, 'config.credential'),
        projectId:   get(this, 'config.projectId'),
        zone:        get(this, 'config.zone'),
      }
    }).then((xhr) => {
      const out = xhr.body;

      set(this, 'versions', out);
      this.versionChanged();

      return out;
    }).catch((xhr) => {
      set(this, 'errors', [xhr.body.error]);

      return reject();
    });
  },

  fetchMachineTypes() {
    return get(this, 'globalStore').rawRequest({
      url:    '/meta/gkeMachineTypes',
      method: 'POST',
      data:   {
        credentials: get(this, 'config.credential'),
        projectId:   get(this, 'config.projectId'),
        zone:        get(this, 'config.zone'),
      }
    }).then((xhr) => {
      const out = xhr.body.items;

      set(this, 'machineTypes', out);

      return out;
    }).catch((xhr) => {
      set(this, 'errors', [xhr.body.error]);

      return reject();
    });
  },

  fetchNetworks() {
    return get(this, 'globalStore').rawRequest({
      url:    '/meta/gkeNetworks',
      method: 'POST',
      data:   {
        credentials: get(this, 'config.credential'),
        projectId:   get(this, 'config.projectId'),
        zone:        get(this, 'config.zone'),
      }
    }).then((xhr) => {
      const out = xhr.body.items || [];

      set(this, 'networks', out);

      if (get(this, 'mode') === 'new') {
        set(this, 'config.network', out[0] && out[0].name)
      }

      return out;
    }).catch((xhr) => {
      set(this, 'errors', [xhr.body.error]);

      return reject();
    });
  },

  fetchSubnetworks() {
    const zone = get(this, 'config.zone')
    const zoneSplit = zone.split('-')

    return get(this, 'globalStore').rawRequest({
      url:    '/meta/gkeSubnetworks',
      method: 'POST',
      data:   {
        credentials: get(this, 'config.credential'),
        projectId:   get(this, 'config.projectId'),
        region:      `${ zoneSplit[0] }-${ zoneSplit[1] }`,
      }
    }).then((xhr) => {
      const out = xhr.body.items || [];

      set(this, 'subNetworks', out);

      return out;
    }).catch((xhr) => {
      set(this, 'errors', [xhr.body.error]);

      return reject();
    });
  },

  fetchServiceAccounts() {
    return get(this, 'globalStore').rawRequest({
      url:    '/meta/gkeServiceAccounts',
      method: 'POST',
      data:   {
        credentials: get(this, 'config.credential'),
        projectId:   get(this, 'config.projectId'),
        zone:        get(this, 'config.zone'),
      }
    }).then((xhr) => {
      const out = xhr.body.accounts || [];

      set(this, 'serviceAccounts', out);
      const filter = out.filter((o) => o.displayName === 'Compute Engine default service account')

      if (get(this, 'mode') === 'new') {
        set(this, 'config.serviceAccount', filter[0] && filter[0].uniqueId)
      }

      return out;
    }).catch((xhr) => {
      set(this, 'errors', [xhr.body.error]);

      return reject();
    });
  },

  validate() {
    const model = get(this, 'cluster');
    const errors = model.validationErrors();
    const { intl, config = {} } = this
    let {
      minNodeCount, maxNodeCount, enableNodepoolAutoscaling, nodeCount
    } = config

    if ( enableNodepoolAutoscaling ) {
      if ( nodeCount && maxNodeCount && minNodeCount ) {
        nodeCount = parseInt(nodeCount, 10);
        maxNodeCount = parseInt(maxNodeCount, 10);
        minNodeCount = parseInt(minNodeCount, 10);

        if (maxNodeCount < minNodeCount) {
          errors.pushObject(intl.t('clusterNew.googlegke.maxNodeCount.minError'))
        }

        if ( enableNodepoolAutoscaling && ( maxNodeCount < nodeCount ) ) {
          errors.pushObject(intl.t('clusterNew.googlegke.nodeCount.outsideError'))
        }

        if ( enableNodepoolAutoscaling && ( minNodeCount > nodeCount ) ) {
          errors.pushObject(intl.t('clusterNew.googlegke.nodeCount.outsideError'))
        }
      } else {
        if ( !nodeCount ) {
          errors.pushObject(intl.t('clusterNew.googlegke.nodeCount.required'))
        }
        if ( !maxNodeCount ) {
          errors.pushObject(intl.t('clusterNew.googlegke.maxNodeCount.required'))
        }
        if ( !minNodeCount ) {
          errors.pushObject(intl.t('clusterNew.googlegke.minNodeCount.required'))
        }
      }
    }

    if (!get(this, 'cluster.name')) {
      errors.pushObject(intl.t('clusterNew.name.required'))
    }

    const taints = get(this, 'taints') || []

    if (taints.length > 0) {
      const filter = taints.filter((t) => !t.key || !t.value)

      if (filter.length > 0) {
        errors.pushObject(intl.t('clusterNew.googlegke.taints.required'))
      }
    }

    set(this, 'errors', errors);

    return errors.length === 0;
  },

  willSave() {
    const config = get(this, 'config') || {}

    if (!get(config, 'enableNodepoolAutoscaling')) {
      setProperties(config, {
        minNodeCount: 0,
        maxNodeCount: 0,
      })
    }

    if (get(this, 'config.useIpAliases') && get(config, 'ipPolicyCreateSubnetwork') && get(config, 'ipPolicyClusterIpv4CidrBlock')) {
      set(config, 'clusterIpv4Cidr', '')
    }

    if (!get(config, 'enableMasterAuthorizedNetwork')) {
      delete config.masterAuthorizedNetworkCidrBlocks
    }

    if (!get(config, 'resourceLabels')) {
      delete config.resourceLabels
    }

    const locationContent = get(this, 'locationContent')
    const locations = locationContent.filter((l) => l.checked).map((l) => l.name)

    if (locations.length > 0) {
      locations.push(get(config, 'zone'))
      set(config, 'locations', locations)
    } else {
      delete config.locations
    }

    if (get(this, 'oauthScopesSelection') === 'default') {
      set(config, 'oauthScopes', DEFAULT_AUTH_SCOPES.map((a) => `https://www.googleapis.com/auth/${ a }`))
    } else if (get(this, 'oauthScopesSelection') === 'full') {
      set(config, 'oauthScopes', ['https://www.googleapis.com/auth/cloud-platform'])
    } else if (get(this, 'oauthScopesSelection') === 'custom') {
      const scopeConfig = get(this, 'scopeConfig') || {}
      let arr = []

      Object.keys(scopeConfig).map((key) => {
        if (scopeConfig[key] !== 'none') {
          arr.pushObject(`https://www.googleapis.com/auth/${ scopeConfig[key] }`)
        }
      })
      set(config, 'oauthScopes', arr)
    }

    const taints = get(this, 'taints') || []

    if (taints.length > 0) {
      set(config, 'taints', taints.map((t) => {
        return `${ t.effect }:${ t.key }=${ t.value }`
      }))
    } else {
      set(config, 'taints', [])
    }

    set(config, 'issueClientCertificate', true)

    return this._super(...arguments);
  },

});
