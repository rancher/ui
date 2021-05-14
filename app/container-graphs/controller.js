import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import C from 'ui/utils/constants';

export default Controller.extend({
  scope:  service(),
  router: service(),

  monitoringEnabled: alias('scope.currentCluster.isMonitoringReady'),

  podStateDidChange: observer('model.pod.state', function() {
    if ( C.REMOVEDISH_STATES.includes(get(this, 'model.pod.state')) && get(this, 'router.currentRouteName') === 'container' ) {
      const workloadId = get(this, 'model.pod.workloadId');

      if ( workloadId ) {
        this.transitionToRoute('workload', workloadId);
      } else {
        this.transitionToRoute('authenticated.project.index');
      }
    }
  }),

  displayEnvironmentVars: computed('model.environment', function() {
    var envs = [];
    var environment = get(this, 'model.environment') || {};

    Object.keys(environment).forEach((key) => {
      envs.pushObject({
        key,
        value: environment[key]
      })
    });

    return envs;
  }),

});
