import Component from '@ember/component';
import Metrics from 'shared/mixins/metrics';
import layout from './template';
import { set } from '@ember/object';

export default Component.extend(Metrics, {
  layout,

  filters: { resourceType: 'pod' },

  projectScope: true,

  init() {
    this._super(...arguments);
    set(this, 'metricParams', { podName: this.resourceId });
  },
});
