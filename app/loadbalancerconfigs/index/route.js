import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    this.send('setPageLayout', {label: 'Load Balancer Configurations', hasAside: 'nav-balancing active', addRoute: 'loadbalancerconfigs.new'});
  },
});
