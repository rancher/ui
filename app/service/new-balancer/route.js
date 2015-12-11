import Ember from 'ember';

export default Ember.Route.extend({
  allServices: Ember.inject.service(),

  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = [
      store.findAll('host'),
      this.get('allServices').choices(),
      store.findAllUnremoved('certificate'),
    ];

    if ( params.serviceId )
    {
      dependencies.pushObject(store.find('service', params.serviceId, {include: ['loadbalancerlisteners']}));
    }

    return Ember.RSVP.all(dependencies, 'Load dependencies').then(function(results) {
      var allHosts = results[0];
      var allServices = results[1];
      var allCertificates = results[2];
      var existing = results[3];

      var launchConfig, lbConfig, balancer, appCookie, lbCookie;
      if ( existing )
      {
        balancer = existing.cloneForNew();
        launchConfig = balancer.get('launchConfig');
        launchConfig.set('type','container');
        launchConfig.set('healthCheck',null);
        launchConfig = store.createRecord(launchConfig);
        balancer.set('launchConfig', launchConfig);

        lbConfig = balancer.get('loadBalancerConfig');
        if ( lbConfig )
        {
          lbConfig.set('type','loadBalancerConfig');
          delete lbConfig.id;
          lbConfig = store.createRecord(lbConfig);
          lbConfig.set('loadBalancerListeners', balancer.get('loadBalancerListeners'));
          balancer.set('loadBalancerConfig', lbConfig);

          appCookie = lbConfig.get('appCookieStickinessPolicy');
          if ( appCookie )
          {
            appCookie.set('type','loadBalancerAppCookieStickinessPolicy');
            appCookie = store.createRecord(appCookie);
            lbConfig.set('appCookieStickinessPolicy', appCookie);
          }

          lbCookie = lbConfig.get('lbCookieStickinessPolicy');
          if ( lbCookie )
          {
            lbCookie.set('type','loadBalancerCookieStickinessPolicy');
            lbCookie = store.createRecord(lbCookie);
            lbConfig.set('lbCookieStickinessPolicy', lbCookie);
          }
        }
      }
      else
      {
        launchConfig = store.createRecord({
          type: 'container',
          commandArgs: [],
          environment: {},
          tty: true,
          stdinOpen: true,
          restartPolicy: {name: 'always'},
        });

        balancer = store.createRecord({
          type: 'loadBalancerService',
          name: '',
          description: '',
          scale: 1,
          environmentId: params.environmentId,
          launchConfig: launchConfig,
          consumedServices: null,
        });
      }

      if ( !lbConfig )
      {
        lbConfig = store.createRecord({
          type: 'loadBalancerConfig',
          name: 'ui-lb-config',
        });
      }

      balancer.set('loadBalancerConfig', lbConfig);

      return {
        allHosts: allHosts,
        allServices: allServices,
        allCertificates: allCertificates,
        existingBalancer: existing,
        service: balancer,
        config: lbConfig,
        launchConfig: launchConfig,
      };
    });
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('tab', 'ssl');
      controller.set('stickiness', 'none');
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
