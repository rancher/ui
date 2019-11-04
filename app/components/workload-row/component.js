import { or } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { computed } from '@ember/object';

export default Component.extend({
  scope:             service(),
  session:           service(),

  layout,
  model:             null,
  tagName:           '',
  subMatches:        null,
  expanded:          null,

  canExpand:         true,
  showInstanceCount: true,
  showImage:         true,

  showLabelRow:      or('model.displayUserLabelStrings.length'),

  actions:      {
    toggle() {
      if (this.toggle) {
        this.toggle(this.model.id);
      }
    },
  },

  podCount: computed('model.pods.[]', function() {
    const { pods = [] } = this.model;

    return pods.length;
  }),
});
