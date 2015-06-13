import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params, transition*/) {
    var env = this.modelFor('environment');
    return env.doAction('exportconfig').then((config) => {
      // Windows needs CRLFs
      config.dockerComposeConfig = config.dockerComposeConfig.split(/\r?\n/).join('\r\n');
      config.rancherComposeConfig = config.rancherComposeConfig.split(/\r?\n/).join('\r\n');

      return Ember.Object.create({
        environment: env,
        composeConfig: config
      });
    });
  },
});
