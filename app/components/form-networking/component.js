import Ember from 'ember';
import Util from 'ui/utils/util';
import ContainerChoices from 'ui/mixins/container-choices';
import ManageLabels from 'ui/mixins/manage-labels';
import C from 'ui/utils/constants';

export default Ember.Component.extend(ManageLabels, ContainerChoices,{
  //Inputs
  instance: null,
  isService: null,
  allHosts: null,
  errors: null,
  initialLabels: null,

  tagName: '',

  didInitAttrs() {
    this.initLabels(this.get('initialLabels'), null, [C.LABEL.DNS, C.LABEL.HOSTNAME_OVERRIDE]);
    this.initNetwork();
    this.initRequestedIp();
    this.initHostname();
    this.initDnsDiscovery();
    this.initDnsResolver();
    this.initDnsSearch();
  },

  actions: {
    addDnsResolver: function() {
      this.get('dnsResolverArray').pushObject({value: ''});
    },
    removeDnsResolver: function(obj) {
      this.get('dnsResolverArray').removeObject(obj);
    },

    addDnsSearch: function() {
      this.get('dnsSearchArray').pushObject({value: ''});
    },
    removeDnsSearch: function(obj) {
      this.get('dnsSearchArray').removeObject(obj);
    },
  },

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
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

  isManagedNetwork: Ember.computed.equal('instance.networkMode','managed'),

  // ----------------------------------
  // Requested IP
  // ----------------------------------
  requestedIp: null,
  initRequestedIp: function() {
    var ip = this.getLabel(C.LABEL.REQUESTED_IP) || '';
    if ( ip && ip.length && this.get('isManagedNetwork') )
    {
      this.set('requestedIp', ip);
    }
    else
    {
      this.set('requestedIp', '');
    }
  },

  requestedIpDidChange: function() {
    var val = this.get('requestedIp');
    if ( val && val.length && this.get('isManagedNetwork') )
    {
      this.setLabel(C.LABEL.REQUESTED_IP, val);
    }
    else
    {
      this.removeLabel(C.LABEL.REQUESTED_IP);
    }
  }.observes('requestedIp','isManagedNetwork'),

  // ----------------------------------
  // Hostname
  // ----------------------------------
  hostname: null,
  initHostname: function() {
    var override = !!this.getLabel(C.LABEL.HOSTNAME_OVERRIDE);
    if ( override )
    {
      this.set('hostname', 'override');
      this.set('instance.hostname', '');
    }
    else
    {
      this.set('hostname', 'custom');
    }
  },

  hostnameDidChange: function() {
    var val = this.get('hostname');
    if ( val === 'override' )
    {
      this.setLabel(C.LABEL.HOSTNAME_OVERRIDE, C.LABEL.HOSTNAME_OVERRIDE_VALUE);
      this.set('instance.hostname', '');
    }
    else
    {
      this.removeLabel(C.LABEL.HOSTNAME_OVERRIDE);
    }
  }.observes('hostname'),

  // ----------------------------------
  // DNS Discovery
  // ----------------------------------
  dnsDiscovery: null,
  initDnsDiscovery: function() {
    var on = !!this.getLabel(C.LABEL.DNS);
    this.set('dnsDiscovery', on);
  },

  dnsDiscoveryDidChange: function() {
    var on = this.get('dnsDiscovery') && this.get('isManagedNetwork');
    if ( on )
    {
      this.setLabel(C.LABEL.DNS, 'true');
    }
    else
    {
      this.removeLabel(C.LABEL.DNS);
      this.set('dnsDiscovery', false);
    }
  }.observes('dnsDiscovery','isManagedNetwork'),

  // ----------------------------------
  // DNS Resolver
  // ----------------------------------
  dnsResolverArray: null,
  initDnsResolver: function() {
    var ary = this.get('instance.dns');
    if ( !ary )
    {
      ary = [];
      this.set('instance.dns',ary);
    }

    this.set('dnsResolverArray', ary.map(function(entry) {
      return {value: entry};
    }));
  },

  dnsDidChange: function() {
    var out = this.get('instance.dns');
    out.beginPropertyChanges();
    out.clear();
    this.get('dnsResolverArray').forEach(function(row) {
      if ( row.value )
      {
        out.push(row.value);
      }
    });
    out.endPropertyChanges();
  }.observes('dnsResolverArray.@each.value'),

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
