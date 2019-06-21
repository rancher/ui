import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  rule:         null,
  editing:      true,

  actions: {
    removeRule(rule) {
      this.removeRule(rule);
    },
  },

  removeRule() {
    throw new Error('removeRule action is required!');
  }
});
