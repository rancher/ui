import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  queryParams: ['environmentId','serviceId'],
  environmentId: null,
  serviceId: null,
  error: null,
  editing: false,
  primaryResource: Ember.computed.alias('model.service'),

  actions: {
    addTargetIp: function() {
      this.get('targetIpArray').pushObject({value: null});
    },
    removeTargetIp: function(obj) {
      this.get('targetIpArray').removeObject(obj);
    },
  },

  initFields: function() {
    this._super();
    this.initTargetIps();
  },

  initTargetIps: function() {
    var existing = this.get('service.externalIpAddresses');
    var out = [];
    if ( existing )
    {
      existing.forEach((ip) => {
        out.push({ value: ip });
      });
    }
    else
    {
      out.push({value: null});
    }

    this.set('targetIpArray', out);
  },

  targetIpsDidChange: function() {
    var out =  (this.get('targetIpArray')||[]).filterProperty('value').map((choice) => {
      return Ember.get(choice,'value');
    }).uniq();

    this.set('service.externalIpAddresses', out);
  }.observes('targetIpArray.@each.{value}'),

  validate: function() {
    this._super();
    var errors = this.get('errors')||[];

    if ( !this.get('service.externalIpAddresses.length') )
    {
      errors.push('Choose one or more targets to send traffic to');
    }

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },

  doneSaving: function() {
    this.transitionToRoute('environment', this.get('environment.id'));
  },
});
