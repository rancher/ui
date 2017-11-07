import { or } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  projects:          service(),
  session:           service(),

  model:             null,
  tagName:           '',
  subMatches:        null,
  expanded:          null,

  showLabelRow:      or('model.displayUserLabelStrings.length'),
  showInstanceCount: true,
  showImage:         true,

  canExpand: computed('model.isReal', function() {
    return !!this.get('model.isReal');
  }),

  actions: {
    toggle() {
      this.sendAction('toggle');
    },
  },
});
