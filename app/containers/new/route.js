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
    var self = this;
    var store = this.get('store');

    var dependencies = [
      store.findAllActive('network'),
      store.findAll('host'), // Need inactive ones in case a link points to an inactive host
    ];

    return Ember.RSVP.all(dependencies, 'Load container dependencies').then(function(results) {
      var networkChoices = results[0];
      var allHosts = results[1];

      var container = self.get('store').createRecord({
        type: 'container',
        requestedHostId: params.hostId,
        commandArgs: [],
        networkIds: [networkChoices.get('firstObject.id')],
        environment: {}
      });

      return Ember.Object.create({
        instance: container,
        networkChoices: networkChoices,
        allHosts: allHosts,
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
      controller.set('hostId', null);
    }
  }
});
