import Component from '@ember/component';
import layout from './template';
import { get, computed } from '@ember/object';

export default Component.extend({
  layout,
  workload:  null,
  scaleMode: null,
  editing:   null,
  isUpgrade: null,

  classNames: ['accordion-wrapper'],

  didReceiveAttrs() {
    if (!this.expandFn) {
      this.set('expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },

  workloadConfig: computed('scaleMode', function() {
    const scaleMode = this.scaleMode;
    const config = get(this, `workload.${ scaleMode }Config`);

    return config;
  }),

  componentName: computed('scaleMode', function() {
    return `container/form-upgrade-${  this.scaleMode.dasherize() }`;
  }),
});
