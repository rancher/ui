import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = [
      store.findAll('host'),
      store.find('stack', params.stackId)
    ];

    if ( params.serviceId )
    {
      dependencies.pushObject(store.find('service', params.serviceId));
    }

    return Ember.RSVP.all(dependencies, 'Load dependencies').then(function(results) {
      var allHosts = results[0];
      var stack = results[1];
      var existing = results[2];

      var external;
      if ( existing )
      {
        external = existing.cloneForNew();
      }
      else
      {
        external = store.createRecord({
          type: 'externalService',
          name: '',
          description: '',
          stackId: stack.get('id'),
          startOnCreate: true,
        });
      }

      return {
        isService: true,
        allHosts: allHosts,
        stack: stack,
        service: external,
      };
    });
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('stackId', null);
      controller.set('serviceId', null);
    }
  },

  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  }
});
