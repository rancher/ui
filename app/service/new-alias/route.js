import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = [];

    if ( params.serviceId )
    {
      dependencies.pushObject(store.find('service', params.serviceId));
    }

    return Ember.RSVP.all(dependencies, 'Load dependencies').then(function(results) {
      var existing = results[0];

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
