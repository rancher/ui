import Route from '@ember/routing/route';
import { set } from '@ember/object';

export default Route.extend({
  model() {
    const original = this.modelFor('authenticated.cluster.quotas.detail');

    set(this, 'originalModel', original);

    return original.clone();
  },

  setupController(controller) {
    this._super(...arguments);
    set(controller, 'originalModel', this.modelFor('authenticated.cluster.quotas.detail'));
  }
});
