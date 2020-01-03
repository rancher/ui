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

  beforeModel() {
    const clusterId = get(this.scope, 'currentCluster.id');

    return this.istio.checkKialiUiEndpoint(clusterId);
  },

  model() {
    const projectId = get(this.scope, 'currentProject.id');

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

    return hash({ namespaces }).then(({ namespaces }) => {
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
