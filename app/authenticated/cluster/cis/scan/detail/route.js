import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:        service(),
  scope:              service(),
  securityScanConfig: service(),
  model(params) {
    const scan = get(this, 'globalStore').find('clusterScan', params.scan_id);
    const report = (async() => {
      return (await scan).loadReport('report');
    })();
    const configMaps = (async() => {
      this.securityScanConfig.setReport(await report);

      return this.securityScanConfig.loadAsyncConfigMap(get(this, 'scope.currentCluster'));
    })();

    return hash({
      clusterScans: get(this, 'globalStore').findAll('clusterScan'),
      scan,
      report,
      nodes:        get(this, 'scope.currentCluster.nodes'),
      configMaps,
    });
  }
});
