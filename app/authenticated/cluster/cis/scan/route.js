import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get, } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:        service(),
  securityScanConfig: service(),
  scope:              service(),

  model() {
    const clusterScans = get(this, 'globalStore').findAll('clusterScan');

    return hash({
      clusterScans,
      reports:      (async() => {
        const scans = await clusterScans;
        const reportPromises = scans.map((scan) => scan.loadReport('report'));

        return await Promise.all(reportPromises);
      })(),
      configMaps: this.securityScanConfig.loadAsyncConfigMap(get(this, 'scope.currentCluster'))
    });
  },
});
