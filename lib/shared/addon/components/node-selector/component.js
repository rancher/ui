import Component from '@ember/component';
import { observer } from '@ember/object'
import layout from './template';
import C from 'ui/utils/constants';

export default Component.extend({
  layout,

  title: null,
  rules: null,
  ruleArray: null,
  operatorChoices: null,

  init() {
    this._super(...arguments);
    this.initRuleArray();
    this.initOperatorChoices();
  },

  actions: {
    addRule(custom) {
      const newRule = custom ? { custom: '' } : { key: '', operator: '=', value: '' };
      this.get('ruleArray').pushObject(newRule);
    },

    removeRule(rule) {
      this.get('ruleArray').removeObject(rule);
    },
  },

  initRuleArray() {
    const rules = this.get('rules') || [];
    const ruleArray = rules.map(rule => {
      return {
        custom: rule,
      };
    });
    this.set('ruleArray', ruleArray);
  },

  initOperatorChoices() {
    const choices = C.SCHED_NODE_SELECTOR_OPERATOR.map(operator => {
      return {
        label: `formScheduling.nodeSelector.operator.${operator.label}`,
        value: operator.value,
      };
    });
    this.set('operatorChoices', choices);
  },

  inputChanged: observer('ruleArray.@each.{key,value,operator,custom}', function () {
    this.set('rules', this.get('ruleArray')
      .filter(r => this.isRuleValid(r))
      .map(r => this.convertRule(r)));
  }),

  isRuleValid(rule) {
    if (rule.operator === 'Exists' || rule.operator === 'DoesNotExist') {
      return rule.key;
    } else {
      return rule.custom || (rule.value && rule.key && rule.operator);
    }
  },

  convertRule(rule) {
    if (rule.custom) {
      return rule.custom;
    }
    switch (rule.operator) {
      case 'Exists':
        return rule.key;
      case 'DoesNotExist':
        return `!${rule.key}`;
      case 'In':
        return `${rule.key} in (${rule.value})`;
      case 'NotIn':
        return `${rule.key} not in (${rule.value})`;
      default:
        return `${rule.key} ${rule.operator} ${rule.value}`;
    }
  },
})
