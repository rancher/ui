import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.get('store').find('loadbalancerconfig', params.loadbalancerconfig_id);
  },
});
