import Component from '@ember/component';
import Metrics from 'shared/mixins/metrics';
import layout from './template';
import { get, set } from '@ember/object';

export default Component.extend(Metrics, {
  layout,

  filters: { resourceType: 'container' },

  projectScope:  true,

  init() {
    this._super(...arguments);
    set(this, 'metricParams', {
      podName:       get(this, 'podId'),
      containerName: get(this, 'resourceId')
    });
  },
});