import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    var orig = this.modelFor('loadbalancerconfig');
    var config = orig.clone();
    var listeners = (orig.get('listeners')||[]).filter((listener) => {
      return ['removed','purging','purged'].indexOf(listener.get('state')) === -1;
    });

    var healthCheck = config.get('healthCheck');
    if ( !healthCheck )
    {
      healthCheck = store.createRecord({
        type: 'loadBalancerHealthCheck',
        interval: 2000,
        responseTimeout: 2000,
        healthyThreshold: 2,
        unhealthyThreshold: 3,
      });

      config.set('healthCheck', healthCheck);
    }

    var appCookie = config.get('appCookieStickinessPolicy');
    if ( !appCookie )
    {
      appCookie = store.createRecord({
        type: 'loadBalancerAppCookieStickinessPolicy',
        mode: 'path_parameters',
        requestLearn: true,
        timeout: 3600000,
      });
    }

    var lbCookie = config.get('lbCookieStickinessPolicy');
    if ( !appCookie )
    {
      lbCookie = store.createRecord({
        type: 'loadBalancerCookieStickinessPolicy'
      });
    }

    return {
      listeners: listeners,
      config: config,
      healthCheck: healthCheck,
      appCookie: appCookie,
      lbCookie: lbCookie,
    };
  },

  setupController: function(controller, model) {
    controller.set('model', model);
    controller.initFields();
  },

  renderTemplate: function() {
    this.render('loadbalancerconfig/edit', {into: 'application', outlet: 'overlay'});
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('tab', 'listeners');
    }
  },

  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  }
});
