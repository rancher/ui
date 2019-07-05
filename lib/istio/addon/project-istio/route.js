import Route from '@ember/routing/route';
import C from 'ui/utils/constants';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

const DEFAULT_ROUTE = 'project-istio.graph';
const VALID_ROUTES = [
  DEFAULT_ROUTE,
  'project-istio.metrics',
  'project-istio.rules',
];

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
      url:    `/k8s/clusters/${ clusterId }/api/v1/namespaces/istio-system/services/http:kiali-http:80/proxy/`,
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

  afterModel(model) {
    let route = get(this, `session.${ C.SESSION.ISTIO_ROUTE }`);

    if ( !VALID_ROUTES.includes(route) ) {
      route = DEFAULT_ROUTE;
    }
    if (model.iconDisabled && route === DEFAULT_ROUTE) {
      this.transitionTo('project-istio.metrics')
    } else {
      this.transitionTo(route)
    }
  },
});
