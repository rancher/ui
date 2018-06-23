import Component from '@ember/component';
import layout from './template';
import { get, computed } from '@ember/object';

export default Component.extend({
  layout,
  workload: null,
  scaleMode: null,
  editing: null,

  classNames: ['accordion-wrapper'],

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function(item) {
          item.toggleProperty('expanded');
      });
    }
  },

  jobConfig: computed('scaleMode', function() {
    const scaleMode = get(this, 'scaleMode');
    const config = scaleMode === 'job' ? get(this, 'workload.jobConfig') : get(this, 'workload.cronJobConfig.jobConfig');
    return config;
  }),
});
