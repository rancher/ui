import { get, set, observer } from '@ember/object'
import Component from '@ember/component';
import layout from './template';
import C from 'shared/utils/constants';

export default Component.extend({
  layout,

  term:      null,

  ruleArray: null,
  editing:   true,

  init() {
    this._super(...arguments);
    this.initRuleArray();
  },

  didInsertElement() {
    if (get(this, 'ruleArray.length') === 0) {
      this.send('addRule');
    }
  },

  actions: {
    addRule() {
      get(this, 'ruleArray').pushObject({ operator: 'In' });
    },

    removeRule(rule) {
      get(this, 'ruleArray').removeObject(rule);
    }
  },

  ruleChanged: observer('ruleArray.@each.{key,operator,values}', function() {
    set(this, 'term.matchExpressions',
      (get(this, 'ruleArray') || [])
        .filter((rule) => {
          if (rule.operator === 'In' || rule.operator === 'NotIn' ) {
            return rule.values;
          }

          return rule.key;
        })
        .map((rule) => {
          const out = {
            key:      rule.key,
            operator: rule.operator,
          };

          if (rule.operator === 'In' || rule.operator === 'NotIn' ) {
            out.values = rule.values.split(',');
          }

          return out;
        }));
  }),

  operatorChoices: C.VOLUME_NODE_SELECTOR_OPERATOR,

  initRuleArray() {
    const ruleArray = [];

    (get(this, 'term.matchExpressions') || []).forEach((requirement) => {
      ruleArray.push({
        key:      requirement.key,
        operator: requirement.operator,
        values:   (requirement.values || []).join(',')
      });
    });

    set(this, 'ruleArray', ruleArray);
  },

});
