import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import Ember from 'ember';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function(/*params, transition*/) {
    var registry = this.get('store').createRecord({
      type:'registry',
      serverAddress: '',
    });

    return registry;
  },

  setupController: function(controller, model) {
    controller.set('credentials', []);
    controller.set('model',model);
    controller.initFields();
  },

  renderTemplate: function() {
    this.render({into: 'application', outlet: 'overlay'});
  },

  actions: {
    cancel: function() {
      this.transitionTo('registries');
    },
  }
});
