import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params, transition*/) {
    var par = this.modelFor('environment');
    var stack = par.get('stack');
    return stack.doAction('exportconfig').then((config) => {
      // Windows needs CRLFs
      config.dockerComposeConfig = config.dockerComposeConfig.split(/\r?\n/).join('\r\n');
      config.rancherComposeConfig = config.rancherComposeConfig.split(/\r?\n/).join('\r\n');

      return Ember.Object.create({
        stack: stack,
        all: par.get('all'),
        composeConfig: config
      });
    });
  },
});
