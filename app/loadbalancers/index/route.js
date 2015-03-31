import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    this.send('setPageLayout', {label: 'Load Balancers', hasAside: 'nav-balancing active', addRoute: 'loadbalancers.new'});
  },
});
