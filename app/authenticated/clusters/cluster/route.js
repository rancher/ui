import Ember from 'ember';

export default Ember.Route.extend({
  activate() {
    this._super();
    this.controllerFor('authenticated').setPageScope('cluster');
  },

  model(params/*,transition*/) {
    return this.get('userStore').find('cluster', params.cluster_id);
  },
});
