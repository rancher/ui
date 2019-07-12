import Component from '@ember/component';
import layout from './template';
import { computed, set } from '@ember/object';

export default Component.extend({
  layout,

  tagName:    'tr',
  classNames: ['main-row'],
  pool:       null,

  deleteNotReadyAfterSecs: computed('pool.deleteNotReadyAfterSecs', {
    get() {
      let { pool: { deleteNotReadyAfterSecs = 0 } } = this;

      return deleteNotReadyAfterSecs / 60;
    },
    set(key, value) {
      let out = value * 60;

      set(this, 'pool.deleteNotReadyAfterSecs', out);

      return value;
    },
  }),

  removePool() {
    throw new Error('removePool action is required!');
  },

  addNodeTemplate() {
    throw new Error('addNodeTemplate action is required!');
  },
});
