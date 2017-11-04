import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  tagName:           'a',
  model:             null,
  currentController: null,
  label:             'Add',

  classNames:        ['btn', 'bg-primary', 'add-to-pod'],

  click: function() {
    this.sendAction();
  }
});
