import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object'

export default Component.extend({
  layout,
  tagName:           'input',
  type:              'radio',
  disabled:          false,
  attributeBindings: ['name', 'type', 'checked:checked', 'disabled:disabled'],

  checked: computed('value', 'selection', function() {
    return this.get('value') === this.get('selection');
  }),
  click() {
    this.set('selection', this.get('value'));
  },

});
