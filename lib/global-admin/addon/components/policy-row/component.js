import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  model:    null,
  policies: null,

  tagName:    'TR',
  classNames: 'main-row',

  actions: {
    remove() {
      this.sendAction('remove', this.get('model'));
    }
  },
});
