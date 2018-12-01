import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  scope:       service(),

  launchConfig: null,

  service:           alias('model.workload'),
  monitoringEnabled: alias('scope.currentCluster.isMonitoringReady'),

  displayEnvironmentVars: computed('service.launchConfig.environment', function() {
    var envs = [];
    var environment = get(this, 'service.launchConfig.environment') || {};

    Object.keys(environment).forEach((key) => {
      envs.pushObject({
        key,
        value: environment[key]
      })
    });

    return envs;
  }),
});
