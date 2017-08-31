import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    let cluster = this.modelFor('authenticated.clusters.cluster');
    let clone = cluster.clone();

    return Ember.Object.create({
      cluster: clone,
    });
  },
});
