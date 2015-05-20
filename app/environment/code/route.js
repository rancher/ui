import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params, transition*/) {
    var env = this.modelFor('environment');
    return env.doAction('exportconfig').then((config) => {
      return Ember.Object.create({
        environment: env,
        composeConfig: config
      });
    });
  },
});
