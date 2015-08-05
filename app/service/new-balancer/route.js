import Ember from 'ember';

export default Ember.Route.extend({
  allServices: Ember.inject.service(),

  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = [
      store.findAll('host'),
      this.get('allServices').choices(),
    ];

    if ( params.serviceId )
    {
      dependencies.pushObject(store.find('service', params.serviceId, {include: ['loadbalancerlisteners']}));
    }

    return Ember.RSVP.all(dependencies, 'Load dependencies').then(function(results) {
      var allHosts = results[0];
      var allServices = results[1];
      var existing = results[2];

      var launchConfig, lbConfig, balancer, appCookie, lbCookie;
      if ( existing )
      {
        balancer = existing.cloneForNew();
        launchConfig = balancer.get('launchConfig');
        launchConfig.set('type','container');
        launchConfig = store.createRecord(launchConfig);
        balancer.set('launchConfig', launchConfig);

        lbConfig = balancer.get('loadBalancerConfig');
        lbConfig.set('type','loadBalancerConfig');
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

        lbConfig = store.createRecord({
          type: 'loadBalancerConfig',
          healthCheck: null,
          appCookieStickinessPolicy: null,
          lbCookieStickinessPolicy: null,
        });

        balancer = store.createRecord({
          type: 'loadBalancerService',
          name: '',
          description: '',
          scale: 1,
          environmentId: params.environmentId,
          launchConfig: launchConfig,
          loadBalancerConfig: lbConfig,
          consumedServices: null,
        });
      }

      if ( !appCookie )
      {
        appCookie = store.createRecord({
          type: 'loadBalancerAppCookieStickinessPolicy',
          mode: 'path_parameters',
          requestLearn: true,
          prefix: false,
          timeout: 3600000,
          maxLength: 1024,
        });
      }

      if ( !lbCookie )
      {
        lbCookie = store.createRecord({
          type: 'loadBalancerCookieStickinessPolicy'
        });
      }

      return {
        isService: true,
        allHosts: allHosts,
        allServices: allServices,
        existingBalancer: existing,
        balancer: balancer,
        service: balancer,
        config: lbConfig,
        launchConfig: launchConfig,
        appCookie: appCookie,
        lbCookie: lbCookie,
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
      controller.set('tab', 'stickiness');
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
