import { get, set } from '@ember/object'
import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  model() {
    let cluster = this.modelFor('authenticated.cluster');

    if ( get(cluster, 'state') !== 'active' ) {
      this.transitionTo('authenticated.cluster.index');
    }

    return hash({ persistentVolumes: get(this, 'clusterStore').findAll('persistentVolume'), });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.storage.persistent-volumes');
  }),
});
