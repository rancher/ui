import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  allServices: null,

  rules: null,
  protocolChoices: null,

  onInit: function() {
    this.set('rules', []);

    let protos = this.get('store').getById('schema','portrule').optionsFor('protocol');
    protos.sort();
    this.set('protocolChoices', protos);
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
        isPublic: true,
        isSelector: isSelector,
        protocol: 'http',
        priority: max+1
      }));
    },

    moveUp(rule) {
    },

    moveDown(rule) {
    },

    removeRule(rule) {
      this.get('rules').removeObject(rule);
    },
  },

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
