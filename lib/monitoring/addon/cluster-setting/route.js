import Route from '@ember/routing/route';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';
import { hash } from 'rsvp';

export default Route.extend({
  session:     service(),
  scope:       service(),
  globalStore: service(),

  model() {
    const store = get(this, 'globalStore');

    const cluster = get(this, 'scope.currentCluster');
    const project = get(cluster, 'systemProject');

    if ( !project || !get(cluster, 'enableClusterMonitoring') ) {
      return { apps: [], }
    }

    return hash({
      apps: store.rawRequest({
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
      }),
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.monitoring.cluster-setting');
  }),
});
