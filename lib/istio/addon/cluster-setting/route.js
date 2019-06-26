import Route from '@ember/routing/route';
import { set, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';
import { all as PromiseAll } from 'rsvp';

const NAMESPACE_NAME = 'istio-system';
const APP_NAME = 'cluster-istio';

export default Route.extend({
  session:     service(),
  scope:       service(),

  model() {
    const cluster = get(this, 'scope.currentCluster');
    const project = get(cluster, 'systemProject');

    if (!project) {
      return { owner: false, }
    }

    const projectStore = get(this, 'store')

    set(projectStore, 'baseUrl', `${ get(this, 'app.apiEndpoint') }/projects/${ project.id }`);

    const apps = projectStore.find('app', null, { forceReload: true })

    const namespaces = cluster.followLink('namespaces')

    const storageClasses = cluster.followLink('storageClasses')

    const persistentVolumeClaims = project.followLink('persistentVolumeClaims')

    return PromiseAll([apps, namespaces, storageClasses, persistentVolumeClaims]).then((data) => {
      const app = data[0].findBy('name', APP_NAME)
      const namespaces = data[1] || [];
      const storageClasses = data[2] || []
      const persistentVolumeClaims = data[3] || []
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
        apps:                   data[0].filter((a) => a.name === APP_NAME),
      }
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.istio.cluster-setting');
  }),
});

