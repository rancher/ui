import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';

const WORLOAD_TYPES = [
  {label: 'Deployment', value: 'deployment'},
  {label: 'Statefulset', value: 'statefulset'},
  {label: 'Daemonset', value: 'daemonset'},
];

export default Component.extend({
  globalStore: service(),
  scope: service(),
  clusterId: reads('scope.currentCluster.id'),
  projectId: reads('scope.currentProject.id'),

  restartIntervalSeconds: null,

  init(...args) {
    this._super(...args);
    set(this, 'workloadTypes', WORLOAD_TYPES);
    const n = get(this, 'model.targetPod.restartIntervalSeconds') / 60 || 5;
    set(this, 'restartIntervalSeconds', n);
    set(this, 'model.targetPod.restartIntervalSeconds', n * 60);
  },

  pods: function() {
    const clusterId = get(this, 'clusterId');
    return get(this, 'store').all('pod').filterBy('clusterId', clusterId);
  }.property('clusterId'),

  deployments: function() {
    const projectId = get(this, 'projectId');
    return get(this, 'store').all('deployment').filterBy('projectId', projectId);
  }.property('projectId'),

  daemonsets: function() {
    const projectId = get(this, 'projectId');
    return get(this, 'store').all('daemonset').filterBy('projectId', projectId);
  }.property('projectId'),

  statefulsets: function() {
    const projectId = get(this, 'projectId');
    return get(this, 'store').all('statefulset').filterBy('projectId', projectId);
  }.property('projectId'),

  restartIntervalSecondsChanged: function() {
    const n = +get(this, 'restartIntervalSeconds') || 5;
    set(this, 'model.targetPod.restartIntervalSeconds', n * 60);
  }.observes('restartIntervalSeconds'),

  workloads: function() {
    const t = get(this, 'model.targetWorkload.workloadType');
    if (t === 'deployment') {
      return get(this, 'deployments');
    }
    if (t === 'daemonset') {
      return get(this, 'daemonsets');
    }
    if (t === 'statefulset') {
      return get(this, 'statefulsets');
    }
  }.property('deployments.[]', 'daemonsets.[]', 'statefulsets.[]', 'model.targetWorkload.workloadType'),

  actions: {
    // todo, don't know that this is needed
    noop() {
    },
  }
});
