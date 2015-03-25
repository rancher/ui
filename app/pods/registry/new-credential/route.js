import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import Ember from 'ember';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function(/*params, transition*/) {
    var cred = this.get('store').createRecord({
      type:'registryCredential',
      publicValue: '',
      secretValue: '',
      email: '',
    });

    return cred;
  },

  setupController: function(controller, model) {
    controller.set('model',model);
    var registryId = this.modelFor('registry').get('id');
    model.set('registryId', registryId);
  },

  renderTemplate: function() {
    this.render({into: 'application', outlet: 'overlay'});
  },

  actions: {
    cancel: function() {
      this.transitionTo('registry');
    },
  }
});
