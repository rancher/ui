import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var LaunchConfig = Resource.extend({
  displayEnvironmentVars: Ember.computed('launchConfig.environment', function() {
    var envs = [];
    var environment = this.get('launchConfig.environment')||{};
    Object.keys(environment).forEach((key) => {
      envs.pushObject({key: key, value: environment[key]})
    });
    return envs;
  }),
});

export default LaunchConfig;
