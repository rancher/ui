import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    this.send('setPageLayout', {label: 'Back', backPrevious: true});
  },

  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  },

  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = [
      store.findAllActive('network'),
      store.findAll('host'), // Need inactive ones in case a link points to an inactive host
      store.findAllActive('registry'),
      store.findAll('service'),
      store.findAll('environment'),
    ];

    return Ember.RSVP.all(dependencies, 'Load container dependencies').then((results) => {
      var networkChoices = results[0];
      var allHosts = results[1];
      var registryChoices = results[2];
      var allServices = results[3];
      var allEnvironments = results[4];

      registryChoices.set('sortProperties',['name','serverAddress','id']);

      var container = store.createRecord({
        type: 'container',
        commandArgs: [],
        networkIds: [networkChoices.get('firstObject.id')],
        environment: {}
      });

      var service = store.createRecord({
        type: 'service',
        environmentId: params.environmentId,
        scale: 1,
        dataVolumesFromService: [],
        launchConfig: container, // Creating a service needs the isntance definition here
      });

      return Ember.Object.create({
        service: service,
        instance: container, // but mixins/edit-container expects to find the instance here, so link both to the same object
        networkChoices: networkChoices,
        allHosts: allHosts,
        registryChoices: registryChoices,
        allServices: allServices,
        allEnvironments: allEnvironments
      });
    });
  },

  setupController: function(controller, model) {
    controller.set('originalModel', null);
    controller.set('model', model);
    controller.initFields();
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('tab', 'command');
      controller.set('advanced', false);
      controller.set('environmentId', null);
    }
  }
});
