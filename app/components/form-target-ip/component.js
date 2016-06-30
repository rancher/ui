import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    addTargetIp: function() {
      this.get('targetIpArray').pushObject({value: null});
    },
    removeTargetIp: function(obj) {
      this.get('targetIpArray').removeObject(obj);
    },
  },

  which         : null,
  userHostname  : null,
  targetIpArray : null,

  init() {
    this._super(...arguments);

    var hostname = this.get('service.hostname');
    if ( hostname )
    {
      this.set('userHostname', hostname);
      this.set('which','hostname');
      this.set('targetIpArray',[]);
    }
    else
    {
      var ips = this.get('service.externalIpAddresses');
      var out = [];
      if ( ips )
      {
        ips.forEach((ip) => {
          out.push({ value: ip });
        });
      }
      else
      {
        out.push({value: null});
      }

      this.set('targetIpArray', out);
      this.set('which','ip');
    }
  },

  valuesDidChange: function() {
    if ( this.get('which') === 'hostname' )
    {
      this.setProperties({
        'service.hostname': this.get('userHostname'),
        'service.externalIpAddresses': null
      });
    }
    else
    {
      var targets = this.get('targetIpArray');
      if ( targets )
      {
        var out =  targets.filterBy('value').map((choice) => {
          return Ember.get(choice,'value');
        }).uniq();

        this.setProperties({
          'service.hostname': null,
          'service.externalIpAddresses': out
        });
      }
    }
  }.observes('targetIpArray.@each.{value}','userHostname','which'),
});
