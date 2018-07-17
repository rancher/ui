import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  model:        null,
  fullColspan:  null,
  leftColspan:  1,
  rightColspan: 1,

  tagName:      '',

  mainColspan: computed('fullColspan', function() {
    return (this.get('fullColspan') || 2) - this.get('leftColspan') - this.get('rightColspan');
  }),
});
