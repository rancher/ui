import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import { get } from '@ember/object';

export default Controller.extend({
  service:            alias('model.workload'),

  launchConfig: null,

  displayEnvironmentVars: computed('service.launchConfig.environment', function() {
    var envs = [];
    var environment = get(this, 'service.launchConfig.environment')||{};
    Object.keys(environment).forEach((key) => {
      envs.pushObject({key: key, value: environment[key]})
    });
    return envs;
  }),
});
