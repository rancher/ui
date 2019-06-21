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
      this.remove(this.model);
    }
  },

  remove() {
    throw new Error('remove action is required!');
  }
});
