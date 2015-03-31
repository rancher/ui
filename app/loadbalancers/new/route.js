import AuthenticatedRouteMixin from 'ui/mixins/authenticated-route';
import Ember from 'ember';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function(/*params, transition*/) {
    var store = this.get('store');

    var dependencies = [
      store.findAll('host'),
    ];

    return Ember.RSVP.all(dependencies, 'Load dependencies').then(function(results) {
      return {
        allHosts: results[0],
        balancer: store.createRecord({type: 'loadBalancer'}),
        config: store.createRecord({
          type: 'loadBalancerConfig',
          healthCheck: store.createRecord({
            type: 'loadBalancerHealthCheck'
          }),
          appCookieStickinessPolicy: store.createRecord({
            type: 'loadBalancerAppCookieStickinessPolicy'
          }),
          lbCookieStickinessPolicy: store.createRecord({
            type: 'loadBalancerCookieStickinessPolicy'
          }),
        })
      };
    });
  },

  setupController: function(controller, model) {
    controller.set('model',model);
    controller.initFields();
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Back', backPrevious: true, hasAside: 'nav-balancing active'});
  },

  renderTemplate: function() {
    this.render('loadbalancers/new', {into: 'balancing'});
  },

  actions: {
    cancel: function() {
      this.transitionTo('loadbalancers');
    },
  }
});
