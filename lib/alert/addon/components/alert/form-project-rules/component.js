import { computed, get, set } from '@ember/object';
import Component from '@ember/component';

const WORLOAD_TYPES = [
  {label: 'Deployment', value: 'deployment'},
  {label: 'Statefulset', value: 'statefulset'},
  {label: 'Daemonset', value: 'daemonset'},
];

export default Component.extend({

  restartIntervalSeconds: null,

  init(...args) {
    this._super(...args);
    set(this, 'workloadTypes', WORLOAD_TYPES);
    const n = get(this, 'model.targetPod.restartIntervalSeconds') / 60 || 5;
    set(this, 'restartIntervalSeconds', n);
    set(this, 'model.targetPod.restartIntervalSeconds', n * 60);
  },

  restartIntervalSecondsChanged: function() {
    const n = +get(this, 'restartIntervalSeconds') || 5;
    set(this, 'model.targetPod.restartIntervalSeconds', n * 60);
  }.observes('restartIntervalSeconds'),

  workloads: function() {
    const t = get(this, 'model.targetWorkload.workloadType');
    if (t === 'deployment') {
      return get(this, 'resourceMap.deployments');
    }
    if (t === 'daemonset') {
      return get(this, 'resourceMap.daemonsets');
    }
    if (t === 'statefulset') {
      return get(this, 'resourceMap.statefulsets');
    }
  }.property('resourceMap.deployments.[]', 'resourceMap.daemonsets.[]', 'resourceMap.statefulsets.[]', 'model.targetWorkload.workloadType'),

  actions: {
    // todo, don't know that this is needed
    noop() {
    },
  }
});
