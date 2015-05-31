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
      dependencies.pushObject(store.find('service', params.serviceId, {include: ['loadbalancerlisteners','consumedservices']}));
    }

    return Ember.RSVP.all(dependencies, 'Load dependencies').then(function(results) {
      var allHosts = results[0];
      var environment = results[1];
      var existing = results[2];

      var launchConfig, lbConfig, balancer, appCookie, lbCookie, healthCheck;
      if ( existing )
      {
        balancer = existing.cloneForNew();
        launchConfig = balancer.get('launchConfig');
        launchConfig.set('type','container');
        launchConfig = store.createRecord(launchConfig);

        lbConfig = balancer.get('loadBalancerConfig');
        lbConfig.set('type','loadBalancerConfig');
        lbConfig = store.createRecord(lbConfig);
        lbConfig.set('loadBalancerListeners', balancer.get('loadBalancerListeners'));

        healthCheck = lbConfig.get('healthCheck');
        lbConfig.set('type','healthCheck');
        lbConfig = store.createRecord(lbConfig);
        lbConfig.set('loadBalancerListeners', balancer.get('loadBalancerListeners'));

        appCookie = lbConfig.get('appCookieStickinessPolicy');
        if ( appCookie )
        {
          appCookie.set('type','loadBalancerAppCookieStickinessPolicy');
          appCookie = store.createRecord(appCookie);
        }

        lbCookie = lbConfig.get('lbCookieStickinessPolicy');
        if ( lbCookie )
        {
          lbCookie.set('type','loadBalancerCookieStickinessPolicy');
          lbCookie = store.createRecord(lbCookie);
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
        });

        healthCheck = store.createRecord({
          type: 'loadBalancerHealthCheck',
          interval: 2000,
          responseTimeout: 2000,
          healthyThreshold: 2,
          unhealthyThreshold: 3,
          requestLine: null,
        });

        lbConfig = store.createRecord({
          type: 'loadBalancerConfig',
          healthCheck: healthCheck,
          appCookieStickinessPolicy: null,
          lbCookieStickinessPolicy: null,
        });

        balancer = store.createRecord({
          type: 'loadBalancerService',
          name: '',
          description: '',
          scale: 1,
          environmentId: environment.get('id'),
          launchConfig: launchConfig,
          loadBalancerConfig: lbConfig,
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
        environment: environment,
        balancer: balancer,
        healthCheck: healthCheck,
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
      controller.set('tab', 'listeners');
      controller.set('stickiness', 'none');
      controller.set('environmentId', null);
      controller.set('serviceId', null);
    }
  },

  actions: {
    cancel: function() {
      this.transitionTo('loadbalancers');
    },
  }
});
