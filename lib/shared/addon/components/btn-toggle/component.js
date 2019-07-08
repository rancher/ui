import Component from '@ember/component';
import layout from './template';
import { observer } from '@ember/object';

export default Component.extend({
  layout,
  classNames:        ['button-toggle'],
  classNameBindings: ['small', 'large'],
  small:             true,
  large:             false,
  checked:           false,

  checkedChanged: observer('checked', function() {
    this.toggled(this.checked);
  }),

  toggled() {
    throw new Error('toggled action is required!');
  },
});
