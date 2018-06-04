import Component from '@ember/component';
import { observer, get, set } from '@ember/object'
import layout from './template';

function populateRule(out, type, field, value) {
  if ( out[type] && out[type][field] ) {
    if ( out[type][field].indexOf(value) === -1 ) {
      out[type][field].push(value);
    }
  } else {
    if ( !out[type] ) {
      out[type] = {};
    }
    out[type][field] = [value];
  }
}

export default Component.extend({
  layout,

  type:      null,
  config:    null,
  isInclude: null,

  ruleArray: null,

  init() {
    this._super(...arguments);
    this.initRuleArray();
  },

  actions: {
    addRule() {
      const newRule = {
        key:   'branch',
        value: ''
      };

      get(this, 'ruleArray').pushObject(newRule);
    },

    removeRule(rule) {
      get(this, 'ruleArray').removeObject(rule);
    },
  },

  inputChanged: observer('ruleArray.@each.{key,value}', function() {
    const ruleArray = get(this, 'ruleArray').filter((r) => r.value && r.key) || [];
    const out = {};

    ruleArray.forEach((rule) => {
      if ( get(this, 'isInclude') ) {
        populateRule(out, rule.key, 'include', rule.value)
      } else {
        populateRule(out, rule.key, 'exclude', rule.value)
      }
    });
    set(this, 'config', out);
  }),
  initRuleArray() {
    const ruleArray = [];
    const key = get(this, 'isInclude') ? 'include' : 'exclude';

    (get(this, `config.branch.${ key }`) || []).forEach((v) => {
      ruleArray.push({
        key:   'branch',
        value: v,
      });
    });

    (get(this, `config.event.${ key }`) || []).forEach((v) => {
      ruleArray.push({
        key:   'event',
        value: v,
      });
    });
    set(this, 'ruleArray', ruleArray);
  },

})
