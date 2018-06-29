import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  globalStore: service(),
  scope:       service(),

  setDefaultRoute: on('activate', function() {

    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.index');

  }),
  model() {

    return this.get('globalStore').findAll('node')
      .then((nodes) => {

        const cluster = this.modelFor('authenticated.cluster');

        return {
          cluster,
          nodes,
        };

      });

  },

});
