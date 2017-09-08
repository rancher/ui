import Ember from 'ember';

export default Ember.Route.extend({

  // chose route action because there is no real need for a controller just for the action
  // when we already have loaded route-action helper
  actions: {
    cancel() {
      this.send('goToPrevious','authenticated.clusters');
    },
  },
  model() {
    let cluster = this.modelFor('authenticated.clusters.cluster');
    let clone = cluster.clone();

    return Ember.Object.create({
      cluster: clone,
    });
  },
});
