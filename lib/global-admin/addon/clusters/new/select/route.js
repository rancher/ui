import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  access:      service(),

  model() {
    return this.modelFor('clusters.new');
  },

  setupController(controller, model) {
    this._super(controller, model);

    let { me: { hasAdmin: globalAdmin = false } } = this.access;

    let { clusterTemplates = [] } = model;

    if (clusterTemplates.length <= 0 && !globalAdmin) {
      controller.set('disabledAddCluster', true);
    }
  },
});
