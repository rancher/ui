import Resource from 'ember-api-store/models/resource';

var Cluster = Resource.extend({
  type: 'cluster',
});

Cluster.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Cluster;
