import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:        service(),
  scope:              service(),
  model(params) {
    const scan = get(this, 'globalStore').find('clusterScan', params.scan_id);
    const report = (async() => {
      return (await scan).loadReport('report');
    })();

    return hash({
      clusterScans: get(this, 'globalStore').findAll('clusterScan'),
      scan,
      report,
      nodes:        get(this, 'scope.currentCluster.nodes'),
    });
  }
});
