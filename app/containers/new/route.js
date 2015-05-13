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

    if ( params.containerId )
    {
      dependencies.pushObject(store.find('container', params.containerId, {include: ['ports']}));
    }

    return Ember.RSVP.all(dependencies, 'Load container dependencies').then(function(results) {
      var networkChoices = results[0];
      var allHosts = results[1];

      var data;
      if ( params.containerId )
      {
        data = results[2].serializeForNew();
      }
      else
      {
        data = {
          type: 'container',
          requestedHostId: params.hostId,
          networkIds: [networkChoices.get('firstObject.id')],
        };
      }

      return Ember.Object.create({
        instance: self.get('store').createRecord(data),
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
      controller.set('environmentId', null);
      controller.set('containerId', null);
    }
  }
});
