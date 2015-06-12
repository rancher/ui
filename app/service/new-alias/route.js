import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = [
      store.findAll('host'),
      store.find('environment', params.environmentId).then(function(env) {
        return env.importLink('services');
      })
    ];

    if ( params.serviceId )
    {
      dependencies.pushObject(store.find('service', params.serviceId));
    }

    return Ember.RSVP.all(dependencies, 'Load dependencies').then(function(results) {
      var allHosts = results[0];
      var environment = results[1];
      var existing = results[2];
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
          environmentId: environment.get('id'),
        });
      }

      dns.set('serviceLinks', serviceLinks);

      return {
        isService: true,
        allHosts: allHosts,
        environment: environment,
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
