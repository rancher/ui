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
      dependencies.pushObject(store.find('service', params.serviceId, {include: ['loadbalancerlisteners']}));
    }

    return Ember.RSVP.all(dependencies, 'Load dependencies').then(function(results) {
      var allHosts = results[0];
      var environment = results[1];
      var existing = results[2];

      var launchConfig, lbConfig, balancer, appCookie, lbCookie;
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
          environmentId: environment.get('id'),
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
        environment: environment,
        existingBalancer: existing,
        balancer: balancer,
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
