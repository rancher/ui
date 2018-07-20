import { computed } from '@ember/object';
import LC from 'ui/models/launchconfig';

var secondaryLaunchConfigs = LC.extend({
  displayEnvironmentVars: computed('launchConfig.environment', function() {
    var envs = [];
    var environment = this.get('launchConfig.environment') || {};

    Object.keys(environment).forEach((key) => {
      envs.pushObject({
        key,
        value: environment[key]
      })
    });

    return envs;
  }),
});

export default secondaryLaunchConfigs;
