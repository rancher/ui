import Component from '@ember/component';
import { get, set, observer } from '@ember/object'
import C from 'ui/utils/constants';
import layout from './template';
import { isEmpty } from '@ember/utils';

const verbs = C.RULE_VERBS;

export default Component.extend({
  layout,

  rule:           null,
  rules:          null,
  resource:       null,
  nonResourceURL: null,
  apiGroup:       null,
  readOnly:       null,
  editing:        true,

  tagName:    'TR',
  classNames: 'main-row',

  init() {
    this._super(...arguments);
    const { rule }     = this;
    let { rules }      = this;
    const {
      resources       = [],
      nonResourceURLs = [],
      apiGroups       = [],
    } = rule;
    const currentVerbs = get(rule, 'verbs');

    set(this, 'verbs', verbs.map((verb) => ({
      key:   verb,
      value: currentVerbs.indexOf('*') > -1 || currentVerbs.indexOf(verb) > -1,
    })));

    if (isEmpty(rules)) {
      rules = C.ROLE_RULES.sort();

      set(this, 'rules', rules.map((rule) => ({
        label: rule,
        value: rule.toLowerCase(),
      })));
    }

    if (resources.get('length') > 0) {
      this.initResourceLikeParams(resources, 'resource');
    }

    if (nonResourceURLs.get('length') > 0) {
      this.initResourceLikeParams(nonResourceURLs, 'nonResourceURL');
    }

    this.initResourceLikeParams(apiGroups, 'apiGroup');
  },

  actions: {
    remove() {
      this.remove(this.rule);
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

  selectedNonResourceUrlChanged: observer('nonResourceURL', function() {
    const rule = get(this, 'rule');

    set(rule, 'nonResourceURLs', [get(this, 'nonResourceURL')])
  }),

  apiGroupsChanged: observer('apiGroup', function() {
    const rule = get(this, 'rule');

    set(rule, 'apiGroups', (get(this, 'apiGroup') || '').split(','))
  }),

  initResourceLikeParams(rules, resourceName) {
    set(this, resourceName, rules.join(','));
  },

  remove() {
    throw new Error('remove action is required!');
  }
});
