import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { all as PromiseAll } from 'rsvp';

const NAME = 'global-registry';

export default Route.extend({
  globalStore: service(),

  model() {
    const store = get(this, 'globalStore');
    const clusters = store.all('cluster');
    const cluster = clusters.findBy('id', 'local');

    const globalRegistryEnabled = store.all('setting').findBy('id', 'global-registry-enabled')

    if (!cluster) {
      return {
        showForm: false,
        globalRegistryEnabled,
      }
    }

    const project = get(cluster, 'systemProject');

    const apps = store.rawRequest({
      url:    get(project, 'links.apps'),
      method: 'GET',
    });

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
      const apps = get(data[0], 'body.data') || [];
      const storageClasses = get(data[2], 'body.data') || []
      const persistentVolumeClaims = get(data[3], 'body.data') || []

      return {
        app:                    apps.findBy('name', NAME),
        nsExists:               true,
        cluster,
        project,
        storageClasses,
        persistentVolumeClaims: persistentVolumeClaims.filter((p) => p.namespaceId === 'cattle-system' && p.state === 'bound'),
        showForm:               true,
      }
    });
  },

  actions: {
    refresh() {
      this.refresh()
    },
  },
});
