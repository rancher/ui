import Route from '@ember/routing/route';
import { set, get, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';
import { all as PromiseAll } from 'rsvp';

const APP_NAME = 'cluster-istio';

export default Route.extend({
  globalStore:  service(),
  clusterStore: service(),
  session:      service(),
  scope:        service(),
  apps:         null,

  model(params, transition) {
    const store = get(this, 'globalStore');
    const projectId = transition.params['authenticated.project'].project_id;
    const cluster = store.all('cluster').findBy('id', projectId.split(':')[0]);
    const systemProject = get(cluster, 'systemProject');

    if ( !systemProject ) {
      this.transitionTo('metrics');

      return { owner: false, };
    }

    const all = [];

    const fetchNamespaces = get(this, 'clusterStore').findAll('namespace');

    if ( !get(this, 'apps') ) {
      const fetchApps = systemProject.followLink('apps')

      all.push(fetchApps);
    }
    all.push(fetchNamespaces);

    return PromiseAll(all).then((data) => {
      const apps = get(all, 'length') === 1 ? get(this, 'apps') : data[0] || [];

      set(this, 'apps', apps);

      const namespaces = data[get(all, 'length') - 1].filter((ns) => {
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
    setProperties(this, {
      [`session.${ C.SESSION.ISTIO_ROUTE }`]:   'graph',
      [`session.${ C.SESSION.PROJECT_ROUTE }`]: 'authenticated.project.istio.graph'
    });
  }),
});

