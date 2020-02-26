import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  scope:      service(),
  layout,
  model:      null,
  sortBy:     'key',
  descending: false,

  isK3sNode:         alias('model.node.isK3sNode'),
  monitoringEnabled: alias('scope.currentCluster.enableClusterMonitoring'),
  isMonitoringReady: alias('scope.currentCluster.isMonitoringReady'),
});
