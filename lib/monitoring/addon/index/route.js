import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';
import { on } from '@ember/object/evented';
import { hash } from 'rsvp';
import C from 'ui/utils/constants';

export default Route.extend({
  globalStore: service(),
  scope:       service(),
  session:     service(),

  model() {
    const store = get(this, 'globalStore');

    const cluster = get(this, 'scope.currentCluster');
    const project = get(cluster, 'systemProject');

    let fetchApps = [];

    if ( project && get(cluster, 'enableClusterMonitoring') ) {
      fetchApps = store.rawRequest({
        url:    `/v3/project/${ get(project, 'id') }/apps`,
        method: 'GET',
      }).then((res) => {
        const out = [];
        const apps = get(res, 'body.data') || [];
        const clusterApp = apps.findBy('name', 'cluster-monitoring');
        const operatorApp = apps.findBy('name', 'monitoring-operator');

        if ( clusterApp ) {
          out.push(store.createRecord(clusterApp));
        }
        if ( operatorApp ) {
          out.push(store.createRecord(operatorApp));
        }

        return out;
      });
    }

    return hash({
      apps:  fetchApps,
      nodes: get(this, 'globalStore').findAll('node')
    });
  },

  afterModel() {
    return hash(
      get(this, 'globalStore').findAll('clusterTemplateRevision'),
      get(this, 'globalStore').findAll('clusterTemplate'),
    );
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.monitoring.index');
  }),
});
