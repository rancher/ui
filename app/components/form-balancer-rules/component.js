import Ember from 'ember';

export default Ember.Component.extend({
  intl: Ember.inject.service(),

  service: null,
  allServices: null,

  rules: null,
  protocolChoices: null,
  showBackend: null,

  onInit: function() {
    let rules = this.get('service.lbConfig.portRules');
    if ( !rules ) {
      rules = [];
      this.set('service.lbConfig.portRules', rules);
    }

    this.set('rules', rules);
    if ( rules.length === 0 ) {
      this.send('addRule');
    }

    let protos = this.get('store').getById('schema','portrule').optionsFor('protocol');
    protos.sort();
    this.set('protocolChoices', protos);

    let hasName = !!rules.findBy('backendName');
    this.set('showBackend', hasName);
  }.on('init'),

  actions: {
    addRule(isSelector) {
      let max = 0;
      let rules = this.get('rules');
      rules.forEach((rule) => {
        max = Math.max(rule.priority,max);
      });

      rules.pushObject(this.get('store').createRecord({
        type: 'portRule',
        access: 'public',
        isSelector: isSelector,
        protocol: 'http',
        priority: max+1
      }));
    },

    moveUp(rule) {
      let rules = this.get('rules');
      let idx = rules.indexOf(rule);
      if ( idx <= 0 ) {
        return;
      }

      let tmp = rules.objectAt(idx-1);
      rules.replace(idx-1, 1, rule);
      rules.replace(idx, 1, tmp);
      this.updatePriorities();
    },

    moveDown(rule) {
      let rules = this.get('rules');
      let idx = rules.indexOf(rule);
      if ( idx < 0 || idx-1 >= rules.get('length') ) {
        return;
      }

      let tmp = rules.objectAt(idx+1);
      rules.replace(idx+1, 1, rule);
      rules.replace(idx, 1, tmp);
      this.updatePriorities();
    },

    removeRule(rule) {
      this.get('rules').removeObject(rule);
    },

    showBackend() {
      this.set('showBackend', true);
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

  serviceChoices: function() {
    let out = {};

    this.get('allServices').slice().sortBy('group','name','id').forEach((service) => {
      if ( !service.lbSafe )
      {
        service.disabled = true;
        service.name += " " + this.get('intl').t('formBalancerRules.serviceId.noHostnames');
      }

      let ary = out[service.group];
      if( !ary ) {
        ary = [];
        out[service.group] = ary;
      }

      ary.push(service);
    });

    return out;
  }.property('allServices.@each.{id,group,name,lbSafe}'),
});
