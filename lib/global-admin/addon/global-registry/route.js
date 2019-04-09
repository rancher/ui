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
        app:      apps.findBy('name', NAME),
        nsExists: !!namespaces.findBy('name', NAME),
        cluster,
        project,
      }
    });
  },
});
