import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

const GRAPH_ROUTE = 'project-istio.graph';

export default Route.extend({
  clusterStore: service(),
  globalStore:  service(),
  session:      service(),

  model(params, transition) {
    const { globalStore } = this
    const projectId = transition.params['authenticated.project'].project_id;
    const project = globalStore.all('project').findBy('id', projectId)
    const clusterId = project.clusterId

    const kiali = globalStore.rawRequest({
      url:    `/k8s/clusters/${ clusterId }/api/v1/namespaces/istio-system/services/http:kiali:20001/proxy/`,
      method: 'GET',
    })

    return hash({ kiali, }).then(() => {
      return { iconDisabled: false, }
    }).catch((err = {}) => {
      const { status } = err

      if (status === 403) {
        return { iconDisabled: true, }
      } else {
        return { iconDisabled: false, }
      }
    })
  },

  afterModel(model, transition) {
    if ( model.iconDisabled && (transition.targetName || '').indexOf(GRAPH_ROUTE) > -1 ) {
      this.transitionTo('project-istio.metrics')
    }
  },
});
