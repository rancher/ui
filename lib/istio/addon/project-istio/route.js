import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const GRAPH_ROUTE = 'project-istio.graph';

export default Route.extend({
  clusterStore: service(),
  globalStore:  service(),
  istio:        service(),
  session:      service(),
  scope:        service(),

  model(params, transition) {
    const { globalStore } = this
    const projectId       = transition.params['authenticated.project'].project_id;
    const project         = globalStore.all('project').findBy('id', projectId)
    const clusterId       = project.clusterId

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
