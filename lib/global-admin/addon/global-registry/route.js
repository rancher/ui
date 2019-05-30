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

    const apps = project.followLink('apps')

    const namespaces = cluster.followLink('namespaces')

    const storageClasses = cluster.followLink('storageClasses')

    const persistentVolumeClaims = project.followLink('persistentVolumeClaims')

    return PromiseAll([apps, namespaces, storageClasses, persistentVolumeClaims]).then((data) => {
      const apps = data[0] || [];
      const storageClasses = data[2] || []
      const persistentVolumeClaims = data[3] || []

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
