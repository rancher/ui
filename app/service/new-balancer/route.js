import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import Ember from 'ember';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = [
      store.findAll('host'),
      store.find('environment', params.environmentId).then(function(env) {
        return env.importLink('services');
      })
    ];

    return Ember.RSVP.all(dependencies, 'Load dependencies').then(function(results) {
      var allHosts = results[0];
      var environment = results[1];

      var launchConfig = store.createRecord({
        type: 'container',
      });

      var lbConfig = store.createRecord({
        type: 'loadBalancerConfig',
        healthCheck: store.createRecord({
          type: 'loadBalancerHealthCheck',
          interval: 2000,
          responseTimeout: 2000,
          healthyThreshold: 2,
          unhealthyThreshold: 3,
          requestLine: null,
        }),
        appCookieStickinessPolicy: null,
        lbCookieStickinessPolicy: null,
      });

      return {
        isService: true,
        allHosts: allHosts,
        environment: environment,
        balancer: store.createRecord({
          type: 'loadBalancerService',
          name: '',
          description: '',
          scale: 1,
          environmentId: environment.get('id'),
          launchConfig: launchConfig,
          loadBalancerConfig: lbConfig,
        }),
        config: lbConfig,
        launchConfig: launchConfig,
        appCookie: store.createRecord({
          type: 'loadBalancerAppCookieStickinessPolicy',
          mode: 'path_parameters',
          requestLearn: true,
          prefix: false,
          timeout: 3600000,
          maxLength: 1024,
        }),
        lbCookie: store.createRecord({
          type: 'loadBalancerCookieStickinessPolicy'
        }),
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
    }
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Back', backPrevious: true});
  },

  actions: {
    cancel: function() {
      this.transitionTo('loadbalancers');
    },
  }
});
