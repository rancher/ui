import Component from '@ember/component';
import { get, set, observer } from '@ember/object'
import C from 'ui/utils/constants';
import layout from './template';

const verbs = C.RULE_VERBS;

export default Component.extend({
  layout,
  rule:     null,
  rules:    null,
  resource: null,
  readOnly: null,

  tagName:    'TR',
  classNames: 'main-row',

  init() {
    this._super(...arguments);
    const rule = get(this, 'rule');
    const currentVerbs = get(rule, 'verbs');

    set(this, 'verbs', verbs.map((verb) => {
      return {
        key:   verb,
        value: currentVerbs.indexOf('*') > -1 || currentVerbs.indexOf(verb) > -1,
      };
    }));
    const rules = C.ROLE_RULES.sort();

    set(this, 'rules', rules.map((rule) => {
      return {
        label: rule,
        value: rule.toLowerCase(),
      };
    }));
    if ((get(rule, 'resources') || []).get('length') > 0) {
      set(this, 'resource', get(rule, 'resources').join(','));
    }
  },

  actions: {
    remove() {
      this.sendAction('remove', get(this, 'rule'));
    }
  },

  verbChanged: observer('verbs.@each.{key,value}', function() {
    const verbs = get(this, 'verbs');
    const selectedVerbs = verbs.filter((verb) => verb.value).map((verb) => verb.key);

    const rule = get(this, 'rule');

    set(rule, 'verbs', selectedVerbs)
  }),

  selectedResourceChanged: observer('resource', function() {
    const rule = get(this, 'rule');

    set(rule, 'resources', [get(this, 'resource')])
  }),
});
