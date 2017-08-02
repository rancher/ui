import Ember from 'ember';
import ContainerChoices from 'ui/mixins/container-choices';
import ManageLabels from 'ui/mixins/manage-labels';
import C from 'ui/utils/constants';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

const UTS_HOST = 'host';

export default Ember.Component.extend(ManageLabels, ContainerChoices,{
  projects:            Ember.inject.service(),
  settings:            Ember.inject.service(),

  //Inputs
  instance:            null,
  isService:           null,
  errors:              null,
  initialLabels:       null,
  isUpgrade:           false,
  retainWasSetOnInit:  false,
  editing:             true,

  classNames: ['accordion-wrapper'],

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
  isManagedNetwork: Ember.computed.equal('instance.networkMode','managed'),
  isHostNetwork: Ember.computed.equal('instance.networkMode','host'),
  isBridgeNetwork: Ember.computed.equal('instance.networkMode','bridge'),

  initNetwork: function() {
    var isService = this.get('isService')||false;

    let mode = this.get('instance.networkMode') || 'managed';

    var choices = ['bridge','container','host','managed','none'];
    if ( this.get('projects.current.isWindows') ) {
      choices = ['nat','transparent'];
      if ( mode === 'managed' ) {
        mode = 'nat';
      }
    }

    var out = [];
    choices.forEach((option) => {
      if ( isService && option === 'container' )
      {
        return;
      }

      out.push({label: 'formNetwork.networkMode.'+option+'.label', value: option});
    });

    this.set('networkChoices', out);
    this.set('instance.networkMode', mode);
  },

  networkModeChanged: function() {
    if ( this.get('instance.networkMode') !== 'container' )
    {
      this.set('instance.networkContainerId', null);
    }
  }.observes('instance.networkMode'),

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
    var host = this.get('instance.uts') === UTS_HOST;
    var hostname = this.get('instance.hostname') || '';

    if ( override ) {
      this.set('hostname', 'override');
      this.set('instance.hostname', '');
    } else if ( host) {
      this.set('hostname', 'host');
    } else if ( hostname ) {
      this.set('hostname', 'custom');
    } else {
      this.set('hostname', 'default');
    }
  },

  hostnameDidChange: function() {
    var val = this.get('hostname');
    if ( val === 'override' ) {
      this.setLabel(C.LABEL.HOSTNAME_OVERRIDE, C.LABEL.HOSTNAME_OVERRIDE_VALUE);
    } else {
      this.removeLabel(C.LABEL.HOSTNAME_OVERRIDE);
    }

    if ( val !== 'custom' ) {
      this.set('instance.hostname', null);
    }

    if ( val === 'uts' ) {
      this.set('instance.uts', UTS_HOST);
    } else {
      this.set('instance.uts', null);
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

  statusClass: null,
  status: function() {
    let k;
    let str;
    let mode = ( this.get('instance.networkMode') || 'none' );

    if ( this.get('errors.length') ) {
      k = STATUS.INCOMPLETE;
      str = this.get('intl').t(`${STATUS_INTL_KEY}.${k}`);
    } else {
      if ( this.get('isManagedNetwork') ) {
        k = STATUS.STANDARD;
      } else {
        k = STATUS.CUSTOM;
      }
      str = this.get('intl').t(`formNetwork.networkMode.${mode}.label`);
    }

    this.set('statusClass', classForStatus(k));
    return str;
  }.property('isManagedNetwork','errors.length'),
});
