import Component from '@ember/component'
import ClusterDriver from 'global-admin/mixins/cluster-driver';

import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { satisfies } from 'shared/utils/parse-version';
import { observer } from '@ember/object';
import { sortableNumericSuffix } from 'shared/utils/util';
import { reject, all } from 'rsvp';

export default Component.extend(ClusterDriver, {
  configField: 'googleKubernetesEngineConfig',

  step: 1,
  zones: null,
  versions: null,
  machineTypes: null,

  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.googleKubernetesEngineConfig');
    if ( !config ) {
      config = this.get('globalStore').createRecord({
        type: 'googleKubernetesEngineConfig',
        diskSizeGb: 100,
        enableAlphaFeature: false,
        nodeCount: 3,
        machineType: 'n1-standard-1',
        zone: 'us-central1-f',
        clusterIpv4Cidr: '',
      });

      set(this, 'cluster.googleKubernetesEngineConfig', config);
    }
  },

  actions: {
    checkServiceAccount() {
      set(this, 'errors', []);
      set(this, 'step', 2);

      return all([
        this.fetchZones(),
        this.fetchVersions(),
        this.fetchMachineTypes()
      ]).then(() => {
        set(this, 'step', 3);
      }).catch(() => {
        set(this, 'step', 1);
      });
    },
  },

  fetchZones() {
    return get(this, 'globalStore').rawRequest({
      url: 'gkeZones',
      method: 'POST',
      data: {
        credentials: get(this, 'config.credential'),
        projectId: get(this, 'config.projectId'),
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
      url: 'gkeVersions',
      method: 'POST',
      data: {
        credentials: get(this, 'config.credential'),
        projectId: get(this, 'config.projectId'),
        zone: get(this, 'config.zone'),
      }
    }).then((xhr) => {
      const out = xhr.body;
      set(this, 'versions', out);
      return out;
    }).catch((xhr) => {
      set(this, 'errors', [xhr.body.error]);
      return reject();
    });
  },

  fetchMachineTypes() {
    return get(this, 'globalStore').rawRequest({
      url: 'gkeMachineTypes',
      method: 'POST',
      data: {
        credentials: get(this, 'config.credential'),
        projectId: get(this, 'config.projectId'),
        zone: get(this, 'config.zone'),
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

  zoneChanged: observer('config.zone','zones.[]', function() {
    const zones = get(this, 'zones')||[];
    const currentZone = zones.findBy('name', get(this, 'config.zone'));
    if ( !currentZone || currentZone.status.toLowerCase() !== 'up' ) {
      const newZone = zones.filter((x) => x.name.startsWith('us-')).find((x) => x.status.toLowerCase() === 'up');
      if ( newZone ) {
        set(this, 'config.zone', newZone.name);
      }
    }

    if ( get(this, 'step') >= 3 ) {
      this.fetchVersions();
      this.fetchMachineTypes();
    }
  }),

  zoneChoices: computed('zones.[]', function() {
    let out = (get(this,'zones')||[]).slice();

    out.forEach((obj) => {
      set(obj, 'sortName', sortableNumericSuffix(obj.name));
      set(obj, 'displayName', obj.name + ' (' + obj.description + ')');
      set(obj, 'disabled', obj.status.toLowerCase() !== 'up');
    });

    return out.sortBy('sortName')
  }),

  machineTypeChanged: observer('config.machineTypes','machineTypes.[]', function() {
    const types = get(this, 'machineTypes')||[];
    const current = types.findBy('name', get(this, 'config.machineType'));
    if ( !current ) {
      set(this, 'config.machineType', get(types, 'firstObject.name'));
    }
  }),

  machineChoices: computed('machineTypes.[]', function() {
    let out = (get(this,'machineTypes')||[]).slice();

    out.forEach((obj) => {
      set(obj, 'sortName', sortableNumericSuffix(obj.name));
      set(obj, 'displayName', obj.name + ' (' + obj.description + ')');
    });

    return out.sortBy('sortName')
  }),

  editedMachineChoice: computed('machineChoices', 'config', function() {
    return get(this, 'machineChoices').findBy('name', get(this, 'config.machineType'));
  }),

  versionChanged: observer('config.masterVersion','versions.validMasterVersions[]', function() {
    const versions = get(this, 'versions.validMasterVersions')||[];
    const current = get(this, 'config.masterVersion');
    const exists = versions.includes(current);
    if ( !exists ) {
      set(this, 'config.masterVersion', versions[0]);
    }
  }),

  versionChoices: computed('config.validMasterVersions.[]', function() {
    const versions = get(this, 'versions');
    const oldestSupportedVersion = get(this, 'config.masterVersion') || '>=1.8.0';
    if ( !versions ) {
      return [];
    }

    let out = versions.validMasterVersions.slice();

    out = out.filter((v) => {
      return satisfies(v.replace(/-.*/,''), oldestSupportedVersion);
    });

    if (get(this, 'editing')) {
      !out.includes(get(this, 'config.masterVersion')) ? out.push(get(this, 'config.masterVersion')) : null;
    }

    return out.map((v) => {
      return {value: v}
    });
  }),

  didSave() {
    const pr = get(this, 'primaryResource');
    return pr.waitForCondition('BackingNamespaceCreated').then(() => {
      return this.alertChildDidSave().then(() => {
        return pr;
      });
    });
  },

  doneSaving() {
    this.get('router').transitionTo('global-admin.clusters.index');
  },
});
