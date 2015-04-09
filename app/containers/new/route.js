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

  model: function(/*params, transition*/) {
    var self = this;
    var store = this.get('store');

    var dependencies = [
      store.findAllActive('network'),
      store.findAllActive('host'),
      store.findAllActive('registry'),
    ];

    return Ember.RSVP.all(dependencies, 'Load container dependencies').then(function(results) {
      var networkChoices = results[0];
      var hostChoices = results[1];
      var registryChoices = results[2];

      registryChoices.set('sortProperties',['name','serverAddress','id']);

      var container = self.get('store').createRecord({
        type: 'container',
        commandArgs: [],
        networkIds: [networkChoices.get('firstObject.id')],
        environment: {}
      });

      return Ember.Object.create({
        instance: container,
        networkChoices: networkChoices,
        hostChoices: hostChoices,
        registryChoices: registryChoices,
      });
    });
  },

  setupController: function(controller, model) {
    // Get the hostId from the query param
    var requested = controller.get('hostId');
    if ( model.get('hostChoices').filterProperty('id',requested).get('length') > 0 )
    {
      model.set('instance.requestedHostId', requested);
    }

    controller.set('originalModel', null);
    controller.set('model', model);
    controller.initFields();
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('tab', 'command');
      controller.set('advanced', false);
    }
  }
});
