import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params, transition*/) {
    var store = this.get('store');
    var registry = store.createRecord({
      type:'registry',
      serverAddress: '',
    });

    var credential = store.createRecord({
      type:'registryCredential',
      registryId: 'tbd',
      email: "not-really@required.anymore"
    });

    return store.find('registry').then((registries) => {
      return Ember.Object.create({
        allRegistries: registries,
        registry: registry,
        credential: credential
      });
    });
  },

  setupController: function(controller, model) {
    controller.set('model',model);
    controller.send('selectDriver','dockerhub');
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('errors', null);
    }
  },
});
