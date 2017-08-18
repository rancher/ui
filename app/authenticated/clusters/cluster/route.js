import Ember from 'ember';

export default Ember.Route.extend({
  model(params/*,transition*/) {
    return this.get('userStore').find('cluster', params.cluster_id);
  },
});
