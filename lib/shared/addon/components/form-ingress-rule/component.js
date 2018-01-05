import EmberObject from '@ember/object';
import { get, set, observer } from '@ember/object'
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  intl: service(),

  ingress: null,

  rules: null,
  errors: null,
  editing: null,
  defaultBackend: null,

  init: function () {
    this._super(...arguments);
    this.initRules();
  },

  actions: {
    addRule() {
      const rule = EmberObject.create({
        host: '',
        paths: {},
      });
      get(this, 'rules').pushObject(rule);
    },

    removeRule(rule) {
      get(this, 'rules').removeObject(rule);
    },

    updateDefaultBackend(rule) {
      set(this, 'defaultBackend', rule);
      if (rule === null) {
        set(this, 'ingress.defaultBackend', null);
      }
    },
  },

  didInsertElement: function () {
    if (get(this, 'rules.length') === 0) {
      this.send('addRule');
    }
  },

  initRules() {
    let rules = [];
    (get(this, 'ingress.rules') || []).forEach(rule => {
      rules.push(rule);
    });
    set(this, 'rules', rules);
  },

  rulesChanged: observer('rules.@each.{paths,host}', 'defaultBackend', function () {
    const rules = get(this, 'rules');
    const defaultBackend = get(this, 'defaultBackend');
    set(this, 'ingress.rules', rules.filter(rule => {
      if (rule === defaultBackend) {
        return false;
      }
      if (Object.keys(get(rule, 'paths')).length === 0) {
        return false;
      }
      return true;
    }));
  }),
});
