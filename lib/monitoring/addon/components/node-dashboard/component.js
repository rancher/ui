import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  scope:  service(),
  layout,
  model:  null,

  monitoringEnabled: alias('scope.currentCluster.enableClusterMonitoring'),
  isMonitoringReady: alias('scope.currentCluster.isMonitoringReady'),
});
