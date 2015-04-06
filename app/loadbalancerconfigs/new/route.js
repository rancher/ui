import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import Ember from 'ember';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function(/*params, transition*/) {
    var store = this.get('store');

    return {
      config: store.createRecord({
        type: 'loadBalancerConfig',
        healthCheck: store.createRecord({
          type: 'loadBalancerHealthCheck',
          interval: 2000,
          responseTimeout: 2000,
          healthyThreshold: 2,
          unhealthyThreshold: 3,
        }),
        appCookieStickinessPolicy: null,
        lbCookieStickinessPolicy: null,
      }),
      appCookie: store.createRecord({
        type: 'loadBalancerAppCookieStickinessPolicy',
        mode: 'path_parameters',
        requestLearn: true,
        timeout: 3600000,
      }),
      lbCookie: store.createRecord({
        type: 'loadBalancerCookieStickinessPolicy'
      }),
    };
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
    this.send('setPageLayout', {label: 'Back', backRoute: 'loadbalancers'});
  },

  actions: {
    cancel: function() {
      this.transitionTo('loadbalancers');
    },
  }
});
