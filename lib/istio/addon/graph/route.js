import Route from '@ember/routing/route';
import { get, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  clusterStore: service(),
  session:      service(),

  model(params, transition) {
    const projectId = transition.params['authenticated.project'].project_id;

    return get(this, 'clusterStore').findAll('namespace').then((data) => {
      const namespaces = data.filter((ns) => {
        if ( get(ns, 'projectId') !== projectId ) {
          return false;
        }
        const labels = get(ns, 'labels') || {};

        return labels['istio-injection'] === 'enabled';
      });

      return namespaces
    });
  },

  setDefaultRoute: on('activate', function() {
    setProperties(this, {
      [`session.${ C.SESSION.ISTIO_ROUTE }`]:   'graph',
      [`session.${ C.SESSION.PROJECT_ROUTE }`]: 'authenticated.project.istio.graph'
    });
  }),
});

