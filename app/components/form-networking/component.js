import Ember from 'ember';
import ContainerChoices from 'ui/mixins/container-choices';
import ManageLabels from 'ui/mixins/manage-labels';
import C from 'ui/utils/constants';

export default Ember.Component.extend(ManageLabels, ContainerChoices,{
  projects:            Ember.inject.service(),
  settings:            Ember.inject.service(),

  //Inputs
  instance:            null,
  isService:           null,
  allHosts:            null,
  errors:              null,
  initialLabels:       null,
  isUpgrade:           false,
  retainWasSetOnInit:  false,
  editing:             true,

  classNameBindings: ['editing:component-editing:component-static'],

  init() {
    this._super(...arguments);
    this.initLabels(this.get('initialLabels'), null, [C.LABEL.DNS, C.LABEL.HOSTNAME_OVERRIDE, C.LABEL.REQUESTED_IP]);
    this.initNetwork();
    this.initRequestedIp();
    this.initHostname();
    this.initDnsDiscovery();
    this.initDnsResolver();
    this.initDnsSearch();
    if (this.get('service.retainIp')) {
      this.set('retainWasSetOnInit', this.get('service.retainIp'));
    }
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

  disableRetainIp: Ember.computed('isUpgrade', 'service.retainIp', 'retainWasSetOnInit', function() {
    let isUpgrade = this.get('isUpgrade');
    let wasSet = this.get('retainWasSetOnInit');
    if ( isUpgrade && wasSet ) {
      return true;
    } else {
      return false;
    }
  }),

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

    var choices = ['bridge','container','host','managed','none'];
    if ( this.get('projects.current.isWindows') ) {
      choices = ['nat','transparent'];
      if ( this.get('instance.networkMode') === 'managed' ) {
        this.set('instance.networkMode','nat');
      }
    }

    var out = [];
    choices.forEach((option) => {
      if ( isService && option === 'container' )
      {
        return;
      }

      out.push({label: 'formNetwork.networkMode.'+option, value: option});
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
  isHostNetwork: Ember.computed.equal('instance.networkMode','host'),

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
    var override = this.getLabel(C.LABEL.HOSTNAME_OVERRIDE) === C.LABEL.HOSTNAME_OVERRIDE_VALUE;
    var hostname = this.get('instance.hostname') || '';

    if ( this.get('isService') )
    {
      if ( override )
      {
        this.set('hostname', 'override');
        this.set('instance.hostname', '');
      }
      else if ( hostname )
      {
        this.set('hostname', 'custom');
      }
      else
      {
        this.set('hostname', 'default');
      }
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
      this.set('instance.hostname', null);
    }
    else if ( val === 'default' )
    {
      this.removeLabel(C.LABEL.HOSTNAME_OVERRIDE);
      this.set('instance.hostname', null);
    }
    else
    {
      this.removeLabel(C.LABEL.HOSTNAME_OVERRIDE);
    }
  }.observes('hostname','instance.hostname'),

  // ----------------------------------
  // DNS Discovery
  // ----------------------------------
  dnsDiscovery: null,
  initDnsDiscovery: function() {
    var on = this.getLabel(C.LABEL.DNS) === 'true';
    this.set('dnsDiscovery', on);
  },

  dnsDiscoveryDidChange: function() {
    var on = this.get('dnsDiscovery') && this.get('isHostNetwork');
    if ( on )
    {
      this.setLabel(C.LABEL.DNS, 'true');
    }
    else
    {
      this.removeLabel(C.LABEL.DNS);
      this.set('dnsDiscovery', false);
    }
  }.observes('dnsDiscovery','isHostNetwork'),

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
