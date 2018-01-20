import Component from '@ember/component'
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { zones, machineTypes } from './data';
import { satisfies } from 'shared/utils/parse-version';
import { observer } from '@ember/object';
import ACC from 'shared/mixins/alert-child-component';
import { sortableNumericSuffix } from 'shared/utils/util';

const M_CONFIG = {
  type: 'clusterRoleTemplateBinding',
  clusterId: '',
  name: '',
  subjectKind: '',
  subjectName: '',
  roleTemplateId: '',
};

export default Component.extend(ACC, {
  globalStore: service(),
  memberArray:     alias('cluster.clusterRoleTemplateBindings'),
  memberConfig:    M_CONFIG,

  primaryResource: alias('cluster'),
  cluster: null,
  config: alias('cluster.googleKubernetesEngineConfig'),

  step: 1,
  errors: null,

  zones: null,
  capabilities: null,
  machineTypes: null,

  init() {
    this._super(...arguments);

    window.gke = this;

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

      this.fetchZones().then(() => {
        this.fetchCapabilities().then(() => {
          this.fetchMachineTypes().then(() => {
            set(this, 'step', 3);
          });
        });
      }).catch((xhr) => {
        set(this, 'errors', [xhr.body.error]);
        set(this, 'step', 1);
      });
    },
  },

  fetchZones() {
    return get(this, 'globalStore').rawRequest({
      url: 'gkeCapabilities', // @TODO use gkeZones
      method: 'POST',
      data: {
        credentials: get(this, 'config.credential'),
        projectId: get(this, 'config.projectId'),
        zone: get(this, 'config.zone') // @TODO-2.0 remove when switching to get zones
      }
    }).then((xhr) => {
      const out = zones; // xhr.body;
      set(this, 'zones', out);
      return out;
    });
  },

  fetchCapabilities() {
    return get(this, 'globalStore').rawRequest({
      url: 'gkeCapabilities',
      method: 'POST',
      data: {
        credentials: get(this, 'config.credential'),
        projectId: get(this, 'config.projectId'),
        zone: get(this, 'config.zone'),
      }
    }).then((xhr) => {
      const out = xhr.body;
      set(this, 'capabilities', out);
      return out;
    });
  },

  fetchMachineTypes() {
    return get(this, 'globalStore').rawRequest({
      url: 'gkeCapabilities', // @TODO user gkeMachineTypes
      method: 'POST',
      data: {
        credentials: get(this, 'config.credential'),
        projectId: get(this, 'config.projectId'),
        zone: get(this, 'config.zone'),
      }
    }).then((xhr) => {
      const out = machineTypes; //xhr.body;
      set(this, 'machineTypes', out);
      return out;
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

    this.fetchCapabilities().catch((xhr) => {
      set(this, 'errors', [xhr.body.error]);
    });

    this.fetchMachineTypes().catch((xhr) => {
      set(this, 'errors', [xhr.body.error]);
    });
  }),

  zoneChoices: computed('zones.[]', function() {
    let out = get(this,'zones').slice();

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

  versionChanged: observer('config.masterVersion','capabilities.validMasterVersions[]', function() {
    const versions = get(this, 'capabilities.validMasterVersions')||[];
    const current = versions.findBy('name', get(this, 'config.masterVersion'));
    if ( !current ) {
      set(this, 'config.masterVersion', get(versions, 'firstObject'));
    }
  }),

  versionChoices: computed('config.validMasterVersions.[]', function() {
    const capabilities = get(this, 'capabilities');
    if ( !capabilities ) {
      return [];
    }

    let out = capabilities.validMasterVersions.slice();

    out = out.filter((v) => {
      return satisfies(v.replace(/-.*/,''), '>=1.8.0');
    });

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
    this.transitionToRoute('clusters.index');
  },
});
