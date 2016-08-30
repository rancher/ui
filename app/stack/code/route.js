import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params, transition*/) {
    var par = this.modelFor('stack');
    var stack = par.get('stack');
    return stack.doAction('exportconfig').then((config) => {
      // Windows needs CRLFs
      var dockerCompose = config.dockerComposeConfig.split(/\r?\n/).join('\r\n');
      var rancherCompose = config.rancherComposeConfig.split(/\r?\n/).join('\r\n');

      return Ember.Object.create({
        stack: stack,
        all: par.get('all'),
        dockerCompose: dockerCompose,
        rancherCompose: rancherCompose,
      });
    });
  },
});
