import Component from '@ember/component'
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { versions, zones, machineTypes } from './data';
import { satisfies } from 'shared/utils/parse-version';
import { observer } from '@ember/object';

export default Component.extend({
  globalStore: service(),

  cluster: null,
  config: alias('cluster.googleKubernetesEngineConfig'),

  machineTypes: computed(function() {
    let out = machineTypes.slice();

    out.forEach((obj) => {
      set(obj, 'displayName', obj.name + ' (' + obj.description + ')');
    });

    return out.sortBy('name')
  }),

  allowedVersions: computed(function() {
    let out = versions.validMasterVersions.slice();

    out = out.filter((v) => {
      return satisfies(v.replace(/-.*/,''), '>=1.8.0');
    });

    return out.map((v) => {
      return {value: v}
    });
  }),

  zones,
  versions,

  init() {
    this._super(...arguments);

    window.gke = this;

    let config = get(this, 'cluster.googleKubernetesEngineConfig');
    if ( !config ) {
      config = this.get('globalStore').createRecord({
        type: 'googleKubernetesEngineConfig',
        diskSizeGb: 100,
        enableAlphaFeature: false,
        masterVersion: '1.8.4-gke.0',
        nodeCount: 3,
        machineType: 'n1-standard-1',
        zone: 'us-central1-f',
        clusterIpv4Cidr: '',
      });

      set(this, 'cluster.googleKubernetesEngineConfig', config);
    }
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
});
