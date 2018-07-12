import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
  globalStore:            service(),
  scope:                  service(),
  restartIntervalSeconds: null,

  projectId: reads('scope.currentProject.id'),

  pods: function() {

    const projectId = get(this, 'projectId');

    return get(this, 'store').all('pod')
      .filterBy('projectId', projectId);

  }.property('projectId'),

  restartIntervalSecondsChanged: function() {

    const n = +get(this, 'restartIntervalSeconds') || 5;

    set(this, 'model.targetPod.restartIntervalSeconds', n * 60);

  }.observes('restartIntervalSeconds'),

  workloads: function() {

    const projectId = get(this, 'projectId');

    return get(this, 'store').all('workload')
      .filterBy('projectId', projectId);

  }.property('projectId'),

  init(...args) {

    this._super(...args);
    const n = get(this, 'model.targetPod.restartIntervalSeconds') / 60 || 5;

    set(this, 'restartIntervalSeconds', n);
    set(this, 'model.targetPod.restartIntervalSeconds', n * 60);

  },

  actions: {
    // todo, don't know that this is needed
    noop() {
    },
  }
});
