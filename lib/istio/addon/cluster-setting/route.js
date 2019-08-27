import Route from '@ember/routing/route';
import { set, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';
import { all as PromiseAll } from 'rsvp';

const NAMESPACE_NAME = 'istio-system';
const APP_NAME = 'cluster-istio';
const MONITORING_APP_NAME = 'cluster-monitoring';

export default Route.extend({
  session:     service(),
  scope:       service(),
  router:      service(),

  beforeModel() {
    const cluster = window.l('route:application').modelFor('authenticated.cluster');

    if (!get(cluster, 'isReady')) {
      get(this, 'router').transitionTo('authenticated.cluster.index')
    }
  },

  model() {
    const cluster = window.l('route:application').modelFor('authenticated.cluster');
    const project = get(cluster, 'systemProject');

    if (!project) {
      return { owner: false, }
    }

    const apps = project.followLink('apps')

    const namespaces = cluster.followLink('namespaces')

    const storageClasses = cluster.followLink('storageClasses')

    const persistentVolumeClaims = project.followLink('persistentVolumeClaims')

    return PromiseAll([apps, namespaces, storageClasses, persistentVolumeClaims]).then((data) => {
      const app = data[0].findBy('name', APP_NAME)
      const monitoringApp = data[0].findBy('name', MONITORING_APP_NAME)
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
        monitoringApp,
      }
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.istio.cluster-setting');
  }),
});

