import Component from '@ember/component';
import { computed, observer } from '@ember/object'
import layout from './template';
import C from 'ui/utils/constants';

export default Component.extend({
  layout,
  tagName: 'TR',
  rule: null,
  editing: true,
  operatorChoices: null,

  init() {
    this._super(...arguments);
    this.initOperatorChoices();
  },

  actions: {
    removeRule() {
      this.sendAction('remove', this.get('rule'));
    },
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

  isJustLabel: computed('rule.operator', function() {
    return ['Exists','DoesNotExist'].includes(this.get('rule.operator'));
  }),

  isMultiple: computed('rule.operator', function() {
    return ['In','NotIn'].includes(this.get('rule.operator'));
  }),
})
