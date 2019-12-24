import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { get } from '@ember/object';

const GRAPH_ROUTE = 'project-istio.graph';

export default Route.extend({
  clusterStore: service(),
  globalStore:  service(),
  session:      service(),
  scope:        service(),

  model() {
    const { globalStore } = this
    const clusterId = get(this.scope, 'currentCluster.id');

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
