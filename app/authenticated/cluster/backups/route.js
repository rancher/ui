import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { alias } from '@ember/object/computed';

export default Route.extend({
  scope:          service(),
  globalStore:    service(),
  currentCluster: alias('scope.currentCluster'),

  model() {
    return this.globalStore.findAll('etcdbackup');
  },

  setupController(controller, model) {
    let { currentCluster } = this;

    let clusterId = get(currentCluster, 'id');

    set(controller, 'currentClusterId', clusterId);

    this._super(controller, model);
  }
});
