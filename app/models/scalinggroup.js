import { computed } from '@ember/object';
import Service from 'ui/models/service';

var ScalingGroup = Service.extend({
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
  type: 'scalingGroup',
});

export default ScalingGroup;
