import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),

  model() {
    const cid = this.paramsFor('authenticated.cluster');
    this.controllerFor('authenticated.cluster.security.roles.index').set('clusterId', cid.cluster_id);
    return get(this, 'globalStore').find('clusterroletemplatebinding', null, {forceReload: true, filter: { clusterId: cid.cluster_id}});
  },

});
