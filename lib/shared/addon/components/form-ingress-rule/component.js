import EmberObject from '@ember/object';
import { get, set, observer } from '@ember/object'
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  intl: service(),

  layout,
  ingress: null,

  rules:   null,
  editing: null,

  init() {
    this._super(...arguments);
    this.initRules();
  },

  didInsertElement() {
    if (get(this, 'rules.length') === 0) {
      this.send('addRule');
    }
  },

  actions: {
    addRule() {
      const rule = EmberObject.create({
        host:  '',
        new:   true,
        paths: [],
      });

      get(this, 'rules').pushObject(rule);
    },

    removeRule(rule) {
      get(this, 'rules').removeObject(rule);
    },
  },

  rulesChanged: observer('rules.@each.{paths,host,defaultBackend}', function() {
    const rules = get(this, 'rules');

    set(this, 'ingress.rules', rules.filter((rule) => {
      if ( rule.defaultBackend ) {
        return false;
      }
      if ( Object.keys(get(rule, 'paths')).length === 0 ) {
        return false;
      }

      return true;
    }));
  }),
  initRules() {
    let rules = [];

    (get(this, 'ingress.rules') || []).forEach((rule) => {
      rules.push(rule);
    });
    const defaultBackend = get(this, 'ingress.defaultBackend');

    if (defaultBackend) {
      rules.push({
        defaultBackend: true,
        paths:          [defaultBackend]
      });
    }
    set(this, 'rules', rules);
  },

});
