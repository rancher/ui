import Component from '@ember/component';
import { get, set, observer } from '@ember/object'
import C from 'ui/utils/constants';
import layout from './template';

const verbs = C.RULE_VERBS;

export default Component.extend({
  layout,
  rule: null,
  rules: null,
  resource: null,

  tagName: 'TR',
  classNames: 'main-row',

  actions: {
    remove: function () {
      this.sendAction('remove', this.get('rule'));
    }
  },

  init: function () {
    this._super(...arguments);
    const rule = this.get('rule');
    const currentVerbs = get(rule, 'verbs');
    this.set('verbs', verbs.map(verb => {
      return {
        key: verb,
        value: currentVerbs.indexOf(verb) > -1,
      };
    }));
    const rules = C.ROLE_RULES;
    this.set('rules', rules.map(rule => {
      return {
        label: rule,
        value: rule,
      };
    }));
    if (get(rule, 'resources').get('length') > 0) {
      this.set('resource', get(rule, 'resources').get(0));
    }
  },

  verbChanged: observer('verbs.@each.{key,value}', function () {
    const verbs = this.get('verbs');
    const selectedVerbs = verbs.filter(verb => verb.value).map(verb => verb.key);

    const rule = this.get('rule');
    set(rule, 'verbs', selectedVerbs)
  }),

  selectedResourceChanged: observer('resource', function () {
    const rule = this.get('rule');
    set(rule, 'resources', [this.get('resource')])
  }),
});
