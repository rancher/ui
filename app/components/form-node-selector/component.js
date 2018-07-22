import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  rule:         null,
  editing:      true,

  actions: {
    removeRule(rule) {
      this.sendAction('removeRule', rule);
    },
  },
});
