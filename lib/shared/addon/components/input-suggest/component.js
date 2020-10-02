import Component from '@ember/component';
import layout from './template';
import $ from 'jquery';

export default Component.extend({
  layout,
  value:       null,
  placheolder: null,

  grouped:     null, // {group1: [val1, val2], group2: [val3, val4]}
  choices:     null, // or [val1, val2, val3, val4]

  classNames: ['input-group'],

  init() {
    this._super(...arguments);
    // event handlers don't get bound context by default...
    this.onOpen = onOpen.bind(this);
  },

  actions: {
    select(value, dd) {
      this.set('value', value);

      if (dd) {
        dd.actions.close();
      }
    }
  }
});

function onOpen() {
  $('.dropdown-menu').css({
    right:     '0',
    maxWidth:  '200px',
    maxHeight: '300px',
    overflow:  'hidden',
    overfloyY: 'auto'
  });
}
