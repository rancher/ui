import Component from '@ember/component';
import { observer } from '@ember/object'
import layout from './template';

export default Component.extend({
  layout,

  title:     null,
  rules:     null,
  ruleArray: null,

  init() {
    this._super(...arguments);
    this.initRuleArray();
  },

  actions: {
    addRule(custom) {
      const newRule = custom ? { custom: '' } : {
        key:      '',
        operator: '=',
        value:    ''
      };

      this.get('ruleArray').pushObject(newRule);
    },

    removeRule(rule) {
      this.get('ruleArray').removeObject(rule);
    },
  },

  inputChanged: observer('ruleArray.@each.{key,value,operator,custom}', function() {
    this.set('rules', this.get('ruleArray')
      .filter((r) => this.isRuleValid(r))
      .map((r) => this.convertRule(r)));
  }),

  initRuleArray() {
    const rules = this.get('rules') || [];
    const ruleArray = rules.map((rule) => ({ custom: rule, }));

    this.set('ruleArray', ruleArray);
  },

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
      return `!${ rule.key }`;
    case 'In':
      return `${ rule.key } in (${ rule.value })`;
    case 'NotIn':
      return `${ rule.key } notin (${ rule.value })`;
    default:
      return `${ rule.key } ${ rule.operator } ${ rule.value }`;
    }
  },
})
