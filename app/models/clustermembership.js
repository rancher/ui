import Resource from 'ember-api-store/models/resource';

var ClusterMembership = Resource.extend({
  type: 'clusterMembership',
});

ClusterMembership.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,

  mangleIn: function(data) {
    try {
      let more = JSON.parse(data.config);
      Object.keys(more).forEach((key) => {
        data[key] = more[key];
      });
      delete data.config;
    } catch(e) {
    }

    return data;
  },
});

export default ClusterMembership;
