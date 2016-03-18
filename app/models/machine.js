import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

var pendingStates = [
  'requested',
  'bootstrapping',
  'creating',
  'created',
  'erroring',
  'error',
  'updating'
];

var Machine = Resource.extend(PolledResource, {
  type: 'machine',
  reservedKeys: ['hostsUpdated','hosts','isPending'],
  actions: {

    clone: function() {
      this.get('router').transitionTo('hosts.new.'+this.get('driver'), {queryParams: {machineId: this.get('id')}});
    },
  },

  availableActions: function() {
    var a = this.get('actionLinks')||{};

    var out = [
      { label: 'Delete', icon: 'icon icon-trash', action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { divider: true },
    ];

    if ( this.hasLink('config') )
    {
      out.push({ label: 'Machine Config', icon: 'icon icon-download', action: 'machineConfig', enabled: true});
    }

    out.push({ label: 'View in API', icon: 'icon icon-external-link',action: 'goToApi', enabled: true});

    return out;
  }.property('actionLinks.remove', 'links.config'),

  hostsUpdated: 0,
  onHostChanged: function() {
    this.incrementProperty('hostsUpdated');
  }.observes('hosts.@each.{id,name,state}'),

  isPending: function() {
    if ( pendingStates.indexOf(this.get('state')) >= 0 )
    {
      return true;
    }
    else
    {
      return this.get('state') === 'active' && this.get('hosts.length') === 0;
    }
  }.property('state','hosts.[]','hostsUpdated'),
});

Machine.reopenClass({
  alwaysInclude: ['hosts'],
  pollTransitioningDelay: 60000,
  pollTransitioningInterval: 60000,

  mangleIn: function(data) {
    if ( !data.hosts )
    {
      data.hosts = [];
    }

    return data;
  },

  stateMap: {
    'bootstrapping':  {icon: 'icon icon-tag',       color: 'text-info'},
    'active':         {icon: 'icon icon-tag',       color: 'text-info'},
  }
});

export default Machine;
