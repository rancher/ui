import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.get('store').find('loadbalancerconfig', params.loadbalancerconfig_id);
  },

  activate: function() {
    this.send('setPageLayout', {label: 'All Balancer Configs', backRoute: 'loadbalancerconfigs', hasAside: 'nav-balancing active'});
  },
});
