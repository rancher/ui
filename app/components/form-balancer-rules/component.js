import Ember from 'ember';
import { parsePortSpec } from 'ui/utils/parse-port';

export default Ember.Component.extend({
  intl: Ember.inject.service(),

  service: null,
  ruleType: 'portRule',
  showListeners: Ember.computed.equal('ruleType','portRule'),

  rules: null,
  protocolChoices: null,
  showBackend: null,
  showIp: null,

  onInit: function() {
    let rules = this.get('service.lbConfig.portRules');
    if ( !rules ) {
      rules = [];
      this.set('service.lbConfig.portRules', rules);
    }

    rules.forEach((rule) => {
      rule.isSelector = !!rule.selector;
    });

    this.set('rules', rules);
    if ( rules.length === 0 ) {
      this.send('addRule');
    }

    let protos = this.get('store').getById('schema','portrule').optionsFor('protocol');
    protos.removeObject('udp');
    protos.sort();
    this.set('protocolChoices', protos);

    if ( this.get('showBackend') === null ) {
      let hasName = !!rules.findBy('backendName');
      this.set('showBackend', hasName);
    }

    if ( this.get('showIp') === null ) {
      this.get('service.launchConfig.ports').forEach((port) => {
        let parsed = parsePortSpec(port,'tcp');
        if ( parsed.hostIp ) {
          this.set('showIp', true);
        }
      });
    }
  }.on('init'),

  actions: {
    addRule(isSelector) {
      let max = 0;
      let rules = this.get('rules');
      rules.forEach((rule) => {
        max = Math.max(rule.priority,max);
      });

      rules.pushObject(this.get('store').createRecord({
        type: this.get('ruleType'),
        access: 'public',
        isSelector: isSelector,
        protocol: 'http',
        priority: max+1,
      }));
    },

    moveUp(rule) {
      let rules = this.get('rules');
      let idx = rules.indexOf(rule);
      if ( idx <= 0 ) {
        return;
      }

      rules.removeAt(idx);
      rules.insertAt(idx-1, rule);
      this.updatePriorities();
    },

    moveDown(rule) {
      let rules = this.get('rules');
      let idx = rules.indexOf(rule);
      if ( idx < 0 || idx-1 >= rules.get('length') ) {
        return;
      }

      rules.removeAt(idx);
      rules.insertAt(idx+1, rule);
      this.updatePriorities();
    },

    removeRule(rule) {
      this.get('rules').removeObject(rule);
    },

    showBackend() {
      this.set('showBackend', true);
    },

    showIp() {
      this.set('showIp', true);
    },
  },

  updatePriorities() {
    let pri = 1;
    this.get('rules').forEach((rule) => {
      rule.set('priority', pri);
      pri++;
    });
  },

  minPriority: function() {
    let val = null;
    this.get('rules').forEach((rule) => {
      let cur = rule.get('priority');
      if ( val === null ) {
        val = cur;
      } else {
        val = Math.min(val, cur);
      }
    });

    return val;
  }.property('rules.@each.priority'),

  maxPriority: function() {
    let val = 0;
    this.get('rules').forEach((rule) => {
      val = Math.max(val, rule.get('priority'));
    });

    return val;
  }.property('rules.@each.priority'),
});
