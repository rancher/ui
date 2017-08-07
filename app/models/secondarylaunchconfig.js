import Ember from 'ember';
import LC from 'ui/models/launchconfig';

var secondaryLaunchConfigs = LC.extend({
  displayEnvironmentVars: Ember.computed('launchConfig.environment', function() {
    var envs = [];
    var environment = this.get('launchConfig.environment')||{};
    Object.keys(environment).forEach((key) => {
      envs.pushObject({key: key, value: environment[key]})
    });
    return envs;
  }),
});

export default secondaryLaunchConfigs;
