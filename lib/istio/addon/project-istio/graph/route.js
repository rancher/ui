import Route from '@ember/routing/route';
import { get, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';
import { hash } from 'rsvp';

export default Route.extend({
  clusterStore: service(),
  globalStore:  service(),
  istio:        service(),
  session:      service(),
  scope:        service(),

  beforeModel(transition) {
    const { globalStore } = this
    const projectId       = transition.params['authenticated.project'].project_id;
    const project         = globalStore.all('project').findBy('id', projectId)
    const clusterId       = project.clusterId

    return this.istio.checkKialiUiEndpoint(clusterId);
  },

  model(params, transition) {
    const projectId = transition.params['authenticated.project'].project_id;
    const namespaces = get(this, 'clusterStore').findAll('namespace').then((data) => {
      const namespaces = data.filter((ns) => {
        if ( get(ns, 'projectId') !== projectId ) {
          return false;
        }
        const labels = get(ns, 'labels') || {};

        return labels['istio-injection'] === 'enabled';
      });

      return namespaces
    });

    return hash({ namespaces }).then((namespaces) => {
      return { namespaces }
    })
  },

  setDefaultRoute: on('activate', function() {
    setProperties(this, {
      [`session.${ C.SESSION.ISTIO_ROUTE }`]:   'project-istio.graph',
      [`session.${ C.SESSION.PROJECT_ROUTE }`]: 'authenticated.project.istio.project-istio.graph'
    });
  }),
});
