import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { set } from '@ember/object';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  globalStore: service(),
  scope:       service(),

  model() {
    const cluster = this.modelFor('authenticated.cluster');

    return this.get('globalStore').findAll('node')
      .then((nodes) => ({
        cluster,
        nodes,
      }));
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.nodes');
  }),
});
