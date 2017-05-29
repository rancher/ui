import Ember from 'ember';

export default Ember.Component.extend({
  rules: null,
  singleTarget: true,
  protocol: null,
  editing: true,
  showBackend: null,

  ruleType: 'portRule',

  didReceiveAttrs() {
    this._super(...arguments);
    if ( this.get('showBackend') !== true ) {
      let hasName = !!((this.get('rules')||[]).findBy('backendName'));
      this.set('showBackend', hasName);
    }
  },

  rulesChanged: function() {
      this.sendAction('rulesChanged');
  }.observes('rules.@each.{hostname,path,kind,instanceId,serviceId,selector,targetPort,backendName}'),

  actions: {
    addRule(kind) {
      let max = 0;
      let rules = this.get('rules');
      rules.forEach((rule) => {
        max = Math.max(rule.priority,max);
      });

      rules.pushObject(this.get('store').createRecord({
        type: this.get('ruleType'),
        kind: kind,
        protocol: this.get('protocol'),
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
  },

  protocolChanged: function() {
    let protocol = this.get('protocol');
    this.get('rules').forEach((rule) => {
      rule.set('protocol', protocol);
    });
  }.observes('protocol'),

  updatePriorities() {
    let pri = 1;
    this.get('rules').forEach((rule) => {
      rule.set('priority', pri);
      pri++;
    });
  },
});
