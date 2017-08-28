import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Ember.Object.create({
      cluster: this.modelFor('authenticated.clusters.cluster'),
      createProject: null,
    });
  },
});
