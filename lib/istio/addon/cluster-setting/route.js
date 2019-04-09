import Route from '@ember/routing/route';
import { set, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';
import { all as PromiseAll } from 'rsvp';

const NAMESPACE_NAME = 'istio-system';
const APP_NAME = 'cluster-istio';

export default Route.extend({
  globalStore: service(),
  session:     service(),
  scope:       service(),

  model() {
    const store = get(this, 'globalStore');
    const cluster = get(this, 'scope.currentCluster');
    const project = get(cluster, 'systemProject');

    const apps = store.rawRequest({
      url:    get(project, 'links.apps'),
      method: 'GET',
    });

    const namespaces = store.rawRequest({
      url:    get(cluster, 'links.namespaces'),
      method: 'GET',
    });

    return PromiseAll([apps, namespaces]).then((data) => {
      const apps = get(data[0], 'body.data') || [];
      const namespaces = get(data[1], 'body.data') || [];

      return {
        app:      apps.findBy('name', APP_NAME),
        nsExists: !!namespaces.findBy('name', NAMESPACE_NAME),
        cluster,
        project,
      }
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.istio.cluster-setting');
  }),
});

