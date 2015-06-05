import Ember from 'ember';

export default Ember.Mixin.create({
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
    var targets = this.get('targetIpArray');
    if ( targets )
    {
      var out =  targets.filterProperty('value').map((choice) => {
        return Ember.get(choice,'value');
      }).uniq();

      this.set('service.externalIpAddresses', out);
    }
  }.observes('targetIpArray.@each.{value}'),
});
