import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

var ClusterMembership = Resource.extend(PolledResource, {
  type: 'clusterMembership',

  parsed: function() {
    let config = {};
    try {
      config = JSON.parse(this.get('config'));
    } catch (e) {
    }

    return Ember.Object.create(config);
  }.property('config'),

  advertiseAddress: Ember.computed.alias('parsed.advertiseAddress'),
  httpPort: Ember.computed.alias('parsed.httpPort'),
  clustered: Ember.computed.alias('parsed.clustered'),
});

ClusterMembership.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default ClusterMembership;
