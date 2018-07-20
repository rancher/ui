import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import layout from './template';

import { get, set, computed, observer } from '@ember/object';
import { satisfies } from 'shared/utils/parse-version';
import { sortableNumericSuffix } from 'shared/utils/util';
import { reject, all } from 'rsvp';


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


export default Component.extend(ClusterDriver, {
  layout,
  configField:            'googleKubernetesEngineConfig',

  step:                   1,
  zones:                  null,
  versions:               null,
  machineTypes:           null,

  initialMasterVersion:   null,
  maintenanceWindowTimes: times,

  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.googleKubernetesEngineConfig');

    if ( !config ) {
      config = this.get('globalStore').createRecord({
        type:               'googleKubernetesEngineConfig',
        diskSizeGb:         100,
        enableAlphaFeature: false,
        nodeCount:          3,
        machineType:        'g1-small',
        zone:               'us-central1-f',
        clusterIpv4Cidr:    '',
      });

      set(this, 'cluster.googleKubernetesEngineConfig', config);
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
        this.fetchMachineTypes()
      ]).then(() => {
        set(this, 'step', 2);
        cb(true);
      }).catch(() => {
        cb(false);
      });
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

    if ( get(this, 'step') >= 2 ) {
      this.fetchVersions();
      this.fetchMachineTypes();
    }
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
    const exists = versions.findBy('value', current);

    if ( !exists ) {
      set(this, 'config.masterVersion', versions[0].value);
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
    const versions = get(this, 'versions');

    if ( !versions ) {
      return [];
    }

    const initialMasterVersion = get(this, 'initialMasterVersion');
    let oldestSupportedVersion = '>=1.8.0';

    if ( initialMasterVersion ) {
      oldestSupportedVersion = `>=${  initialMasterVersion }`;
    }

    let out = versions.validMasterVersions.slice();

    out = out.filter((v) => {
      const str = v.replace(/-.*/, '');

      return satisfies(str, oldestSupportedVersion);
    });

    if (get(this, 'editing') &&  !out.includes(initialMasterVersion) ) {
      out.unshift(initialMasterVersion);
    }

    return out.map((v) => {
      return { value: v }
    });
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

});
