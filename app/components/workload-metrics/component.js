import Component from '@ember/component';
import Metrics from 'shared/mixins/metrics';
import layout from './template';
import { get, set } from '@ember/object';

export default Component.extend(Metrics, {
  layout,

  filters: { resourceType: 'workload' },

  projectScope:  true,

  init() {
    this._super(...arguments);
    set(this, 'metricParams', { workloadName: get(this, 'resourceId') });
  },

});