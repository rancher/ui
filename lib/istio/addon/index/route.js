import Route from '@ember/routing/route';
import { set, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';
import { all as PromiseAll } from 'rsvp';

const APP_NAME = 'cluster-istio';

export default Route.extend({
  globalStore:  service(),
  clusterStore: service(),
  session:      service(),

  model(params, transition) {
    const store = get(this, 'globalStore');
    const projectId = transition.params['authenticated.project'].project_id;
    const cluster = store.all('cluster').findBy('id', projectId.split(':')[0]);
    const systemProject = get(cluster, 'systemProject');

    if ( !systemProject ) {
      this.transitionTo('metrics');

      return { owner: false, };
    }

    const apps = store.rawRequest({
      url:    get(systemProject, 'links.apps'),
      method: 'GET',
    });

    const namespaces = get(this, 'clusterStore').findAll('namespace');

    return PromiseAll([apps, namespaces]).then((data) => {
      const apps = get(data[0], 'body.data') || [];
      const namespaces = data[1].filter((ns) => {
        if ( get(ns, 'projectId') !== projectId ) {
          return false;
        }
        const labels = get(ns, 'labels') || {};

        return labels['istio-injection'] === 'enabled';
      });

      return {
        app:   apps.findBy('name', APP_NAME),
        cluster,
        owner: true,
        namespaces,
      }
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.istio.index');
  }),
});

