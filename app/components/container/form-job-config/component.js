import Component from '@ember/component';
import layout from './template';
import { get, computed } from '@ember/object';

export default Component.extend({
  layout,
  workload:   null,
  scaleMode:  null,
  editing:    null,

  classNames: ['accordion-wrapper'],

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },
  jobConfig: computed('scaleMode', function() {
    const scaleMode = get(this, 'scaleMode');
    let config;

    if ( scaleMode === 'job' ) {
      config = get(this, 'workload.jobConfig');
    } else {
      config = get(this, 'workload.cronJobConfig.jobConfig');
    }

    return config;
  }),

});
