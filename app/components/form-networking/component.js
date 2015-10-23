import Ember from 'ember';
import Util from 'ui/utils/util';
import ContainerChoices from 'ui/mixins/container-choices';

export default Ember.Component.extend(ContainerChoices,{
  //Inputs
  instance: null,

  tagName: '',

  didInitAttrs() {
    this.initNetwork();
    this.initDns();
    this.initDnsSearch();
  },

  actions: {
    addDns: function() {
      this.get('dnsArray').pushObject({value: ''});
    },
    removeDns: function(obj) {
      this.get('dnsArray').removeObject(obj);
    },

    addDnsSearch: function() {
      this.get('dnsSearchArray').pushObject({value: ''});
    },
    removeDnsSearch: function(obj) {
      this.get('dnsSearchArray').removeObject(obj);
    },
  },

  // ----------------------------------
  // Network
  // ----------------------------------
  networkChoices: null,
  isContainerNetwork: Ember.computed.equal('instance.networkMode','container'),
  initNetwork: function() {
    var isService = this.get('isService')||false;
    var choices = this.get('store').getById('schema','container').get('resourceFields.networkMode').options.sort();
    var out = [];
    choices.forEach((option) => {
      if ( isService && option === 'container' )
      {
        return;
      }

      out.push({label: Util.ucFirst(option), value: option});
    });

    this.set('networkChoices', out);
  },

  networkModeChanged: function() {
    if ( this.get('instance.networkMode') !== 'container' )
    {
      this.set('instance.networkContainerId', null);
    }
  }.observes('instance.networkMode'),


  // ----------------------------------
  // DNS
  // ----------------------------------
  dnsArray: null,
  initDns: function() {
    var ary = this.get('instance.dns');
    if ( !ary )
    {
      ary = [];
      this.set('instance.dns',ary);
    }

    this.set('dnsArray', ary.map(function(entry) {
      return {value: entry};
    }));
  },

  dnsDidChange: function() {
    var out = this.get('instance.dns');
    out.beginPropertyChanges();
    out.clear();
    this.get('dnsArray').forEach(function(row) {
      if ( row.value )
      {
        out.push(row.value);
      }
    });
    out.endPropertyChanges();
  }.observes('dnsArray.@each.value'),

  // ----------------------------------
  // DNS Search
  // ----------------------------------
  dnsSearchArray: null,
  initDnsSearch: function() {
    var ary = this.get('instance.dnsSearch');
    if ( !ary )
    {
      ary = [];
      this.set('instance.dnsSearch',ary);
    }

    this.set('dnsSearchArray', ary.map(function(entry) {
      return {value: entry};
    }));
  },
  dnsSearchDidChange: function() {
    var out = this.get('instance.dnsSearch');
    out.beginPropertyChanges();
    out.clear();
    this.get('dnsSearchArray').forEach(function(row) {
      if ( row.value )
      {
        out.push(row.value);
      }
    });
    out.endPropertyChanges();
  }.observes('dnsSearchArray.@each.value'),
});
