import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  access:      service(),
  settings:    service(),

  model() {
    return this.modelFor('clusters.new');
  },

  setupController(controller, model) {
    this._super(controller, model);

    let { me: { hasAdmin: globalAdmin = false } } = this.access;
    let { clusterTemplates = [] }                 = model;
    let { clusterTemplateEnforcement = false }    = this.settings;

    // setting is string value
    if (clusterTemplateEnforcement === 'true') {
      clusterTemplateEnforcement = true;
    } else {
      clusterTemplateEnforcement = false;
    }

    if (!globalAdmin && clusterTemplateEnforcement) {
      if (clusterTemplates.length <= 0) {
        controller.set('disabledAddCluster', true);
      }
    }
  },
});
