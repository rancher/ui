import { or } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { computed } from '@ember/object';

export default Component.extend({
  scope:          service(),
  session:           service(),

  layout,
  model:             null,
  tagName:           '',
  subMatches:        null,
  expanded:          null,

  showInstanceCount: true,
  showImage:         true,

  showLabelRow:      or('model.displayUserLabelStrings.length'),
  canExpand:    computed('model.isReal', function() {

    return !!this.get('model.isReal');

  }),

  actions: {
    toggle() {

      this.sendAction('toggle');

    },
  },
});
