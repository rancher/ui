import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),

  model() {
    const cid = this.paramsFor('authenticated.cluster');
    return get(this, 'globalStore').findAll('clusterroletemplatebinding', {forceReload: true, filter: { clusterId: cid.cluster_id}});
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('clusterId', get(model, 'firstObject.clusterId'));
  }

});
