import { get, set, observer } from '@ember/object'
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  rule: null,
  rules: null,
  ingress: null,
  editing: true,
  defaultBackend: null,

  checked: false,

  actions: {
    removeRule(rule) {
      this.sendAction('removeRule', rule);
    },
  },

  checkedChanged: observer('checked', function () {
    const rule = get(this, 'rule');
    if (get(this, 'checked')) {
      this.sendAction('updateDefaultBackend', rule);
    } else if (rule === get(this, 'defaultBackend')) {
      this.sendAction('updateDefaultBackend', null);
    }
  }),

  defaultBackendChanged: observer('defaultBackend', function () {
    const checked = get(this, 'defaultBackend') === get(this, 'rule');
    set(this, 'checked', checked);
  }),
});
