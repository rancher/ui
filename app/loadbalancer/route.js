import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.get('store').find('loadbalancer', params.loadbalancer_id);
  },

  activate: function() {
    this.send('setPageLayout', {label: 'All Load Balancers', backRoute: 'loadbalancers', hasAside: 'nav-balancing active'});
  },
});
