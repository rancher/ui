import EmberObject from '@ember/object';
import { get, set, observer } from '@ember/object'
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  intl: service(),

  layout,

  model: null,

  rules:   null,
  editing: null,

  init() {
    this._super(...arguments);
    this.initRules();
  },

  actions: {
    addRule() {
      const rule = EmberObject.create({});

      get(this, 'rules').pushObject(rule);
    },

    removeRule(rule) {
      get(this, 'rules').removeObject(rule);
    },
  },

  rulesChanged: observer('rules.@each.matchExpressions', function() {
    const out = (get(this, 'rules') || []).filter((rule) => {
      return rule.matchExpressions && rule.matchExpressions.length > 0;
    });

    if (this.changed) {
      this.changed({ nodeSelectorTerms: out });
    }
  }),

  initRules() {
    let rules = [];

    (get(this, 'model.nodeSelectorTerms') || []).forEach((term) => {
      rules.push({ matchExpressions: term.matchExpressions });
    });

    set(this, 'rules', rules);
  },

});
