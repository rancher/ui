import Ember from 'ember';

export default Ember.Route.extend({
  allServices: Ember.inject.service(),

  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = [
      this.get('allServices').choices(),
    ];

    if ( params.serviceId )
    {
      dependencies.pushObject(store.find('service', params.serviceId));
    }

    return Ember.RSVP.all(dependencies, 'Load dependencies').then(function(results) {
      var allServices = results[0];
      var existing = results[1];

      var dns;
      if ( existing )
      {
        dns = existing.cloneForNew();
      }
      else
      {
        dns = store.createRecord({
          type: 'dnsService',
          name: '',
          description: '',
          stackId: params.stackId,
          startOnCreate: true,
        });
      }

      return {
        allServices: allServices,
        service: dns,
        existing: existing,
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
});
