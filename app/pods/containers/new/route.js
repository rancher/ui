import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    this.send('setPageLayout', {label: 'Back', backPrevious: true});
  },

  actions: {
    cancel: function() {
      this.send('goToPrevious');
    },
  },

  model: function(/*params, transition*/) {
    var self = this;

    var dependencies = [
      this.get('store').find('network'),
      this.get('store').find('host')
    ];

    return Ember.RSVP.all(dependencies, 'Load container dependencies').then(function(results) {
      var networks = results[0].sortBy('name','id');

      self.set('networkChoices', networks);

      var networkId = self.get('lastNetworkId');
      if ( !networkId )
      {
        networkId = networks.get('firstObject.id');
      }

      var model = self.get('store').createRecord({
        type: 'container',
        commandArgs: [],
        networkIds: [networkId],
        environment: {}
      });

      return model;
    });
  },

  lastNetworkId: null,
  exit: function() {
    this._super();

    // Remember defaults for future creates
    this.set('lastNetworkId', (this.get('controllernetworkIds')||[])[0]);
  },

  setupController: function(controller, model) {
    model.set('requestedHostId', controller.get('hostId'));
    controller.set('networkChoices', this.get('networkChoices'));
    controller.set('originalModel', null);
    controller.set('model', model);
    controller.initFields();
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('tab', 'command');
    }
  }
});
