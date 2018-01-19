import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import Preload from 'ui/mixins/preload';
import { reject } from 'rsvp';

export default Route.extend(Preload, {
  scope: service(),

  model(params, transition) {
    return get(this, 'globalStore').find('cluster', params.cluster_id).then((cluster) => {
      return get(this, 'scope').startSwitchToCluster(cluster).then(() => {
        return this.loadSchemas('clusterStore').then(() => {
          return cluster;
        });
      }).catch((err) => {
        // @TODO-2.0 right now the API can't return schemas for a not-active cluster
        if ( err.status === 404 ) {
          return cluster;
        } else {
          return reject(err);
        }
      });
    }).catch((err) => {
      return this.loadingError(err, transition);
    });
  },

  setupController(controller, model) {
    this._super(...arguments);
    get(this, 'scope').finishSwitchToCluster(model);
  },
});
