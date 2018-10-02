import { or } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'

export default Component.extend({
  scope:          service(),
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
      this.sendAction('toggle');
    },
  },
});
