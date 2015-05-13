import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import Ember from 'ember';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function(/*params, transition*/) {
    var registry = this.get('store').createRecord({
      type:'registry',
      serverAddress: '',
    });

    var credential = this.get('store').createRecord({
      type:'registryCredential',
      registryId: 'tbd',
    });

    return Ember.Object.create({
      registry: registry,
      credential: credential
    });
  },

  setupController: function(controller, model) {
    controller.set('model',model);
    controller.initFields();
    controller.send('selectDriver','dockerhub');
  },

  activate: function() {
    this.send('setPageLayout', {label: 'All Registries', backRoute: 'registries'});
  },

  actions: {
    cancel: function() {
      this.transitionTo('registries');
    },
  }
});
