import Component from '@ember/component';
import Metrics from 'shared/mixins/metrics';
import layout from './template';

export default Component.extend(Metrics, {
  layout,

  filters: { resourceType: 'node' },
});
