import Route from '@ember/routing/route';

export default Route.extend({
  activate() {
    this._super();
    this.controllerFor('authenticated').setPageScope('cluster');
  },

  model(params/*,transition*/) {
    return this.get('userStore').find('cluster', params.cluster_id);
  },
});
