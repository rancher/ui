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

    if (!project) {
      return { owner: false, }
    }

    const projectStore = get(this, 'store')

    set(projectStore, 'baseUrl', `${ get(this, 'app.apiEndpoint') }/projects/${ project.id }`);

    const apps = projectStore.find('app', null, { forceReload: true })

    const namespaces = store.rawRequest({
      url:    get(cluster, 'links.namespaces'),
      method: 'GET',
    });

    const storageClasses = store.rawRequest({
      url:    get(cluster, 'links.storageClasses'),
      method: 'GET',
    })

    const persistentVolumeClaims = store.rawRequest({
      url:    get(project, 'links.persistentVolumeClaims'),
      method: 'GET',
    })

    return PromiseAll([apps, namespaces, storageClasses, persistentVolumeClaims]).then((data) => {
      const app = data[0].findBy('name', APP_NAME)
      const namespaces = get(data[1], 'body.data') || [];
      const storageClasses = get(data[2], 'body.data') || []
      const persistentVolumeClaims = get(data[3], 'body.data') || []
      const namespace = namespaces.findBy('name', NAMESPACE_NAME)

      return {
        app,
        nsExists:               !!namespace,
        cluster,
        project,
        storageClasses,
        persistentVolumeClaims: persistentVolumeClaims.filter((p) => p.namespaceId === NAMESPACE_NAME && p.state === 'bound'),
        namespace,
        owner:                  true,
      }
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.istio.cluster-setting');
  }),
});

