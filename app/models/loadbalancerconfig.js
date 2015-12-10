import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var LoadBalancerConfig = Resource.extend({
  type: 'loadBalancerConfig',
  config: function() {
    return this;
  }.property()
});

LoadBalancerConfig.reopenClass({
  alwaysInclude: ['loadBalancers'],
});

export default LoadBalancerConfig;
