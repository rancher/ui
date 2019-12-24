import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

const GRAPH_ROUTE = 'project-istio.graph';

export default Route.extend({
  clusterStore: service(),
  globalStore:  service(),
  istio:        service(),
  session:      service(),
  scope:        service(),

  model() {
    const clusterId = get(this.scope, 'currentCluster.id');

    return this.istio.checkKialiUiEndpoint(clusterId).then(() => {
      return { iconDisabled: false };
    }).catch(() => {
      return { iconDisabled: true };
    });
  },

  afterModel(model, transition) {
    if ( model.iconDisabled && (transition.targetName || '').indexOf(GRAPH_ROUTE) > -1 ) {
      this.transitionTo('project-istio.metrics')
    }
  },
});
