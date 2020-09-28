import Route from '@ember/routing/route';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  session:      service(),
  scope:        service(),
  globalStore:  service(),
  clusterStore: service(),

  async model() {
    const globalStore = get(this, 'globalStore');

    const cluster = get(this, 'scope.currentCluster');
    const project = get(cluster, 'systemProject');

    const namespaces = await this.clusterStore.findAll('namespace');
    const cattleMonitoringNamespaceExists = namespaces.any((ns) => ns.id === 'cattle-monitoring-system');

    if ( !project || !get(cluster, 'enableClusterMonitoring') ) {
      return {
        apps: [],
        cattleMonitoringNamespaceExists
      }
    }

    let res = await globalStore.rawRequest({
      url:    `/v3/project/${ get(project, 'id') }/apps`,
      method: 'GET',
    });

    const out = [];
    const apps = get(res, 'body.data') || [];
    const clusterApp = apps.findBy('name', 'cluster-monitoring');
    const operatorApp = apps.findBy('name', 'monitoring-operator');

    if ( clusterApp ) {
      out.push(globalStore.createRecord(clusterApp));
    }
    if ( operatorApp ) {
      out.push(globalStore.createRecord(operatorApp));
    }


    return {
      apps: out,
      cattleMonitoringNamespaceExists
    }
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.monitoring.cluster-setting');
  }),
});
