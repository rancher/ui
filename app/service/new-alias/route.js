import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = [
      store.findAll('host'),
      store.findAll('environment'), // Need inactive ones in case a service points to an inactive environment
      store.findAllUnremoved('service'),
    ];

    if ( params.serviceId )
    {
      dependencies.pushObject(store.find('service', params.serviceId));
    }

    return Ember.RSVP.all(dependencies, 'Load dependencies').then(function(results) {
      var allHosts = results[0];
      var allEnvironments = results[1];
      var allServices = results[2];
      var existing = results[3];

      var serviceLinks = [];

      var dns;
      if ( existing )
      {
        dns = existing.cloneForNew();
        serviceLinks = existing.get('consumedServicesWithNames');
      }
      else
      {
        dns = store.createRecord({
          type: 'dnsService',
          name: '',
          description: '',
          environmentId: params.environmentId,
        });
      }

      dns.set('serviceLinks', serviceLinks);

      return {
        isService: true,
        allHosts: allHosts,
        allEnvironments: allEnvironments,
        allServices: allServices,
        dns: dns,
      };
    });
  },

  setupController: function(controller, model) {
    controller.set('model',model);
    controller.initFields();
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('environmentId', null);
      controller.set('serviceId', null);
    }
  },

  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  }
});
