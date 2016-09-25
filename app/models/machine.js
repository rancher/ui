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
      this.get('router').transitionTo('hosts.new', {queryParams: {machineId: this.get('id'), driver: this.get('driver')}});
    },
  },

  availableActions: function() {
    var a = this.get('actionLinks')||{};

    var out = [
      { label: 'action.remove', icon: 'icon icon-trash', action: 'promptDelete', enabled: !!a.remove, altAction: 'delete'},
      { divider: true },
      { label: 'action.clone', icon: 'icon icon-copy', action: 'clone', enabled: true },
    ];

    if ( this.hasLink('config') )
    {
      out.push({ label: 'action.machineConfig', icon: 'icon icon-download', action: 'machineConfig', enabled: true});
    }

    out.push({ label: 'action.viewInApi', icon: 'icon icon-external-link',action: 'goToApi', enabled: true});

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

  combinedState: function() {
    let state = this.get('state');
    if (state === 'active' )
    {
      return 'waiting';
    }
    else
    {
      return state;
    }
  }.property('state'),
});

Machine.reopenClass({
  stateMap: {
    'bootstrapping':  {icon: 'icon icon-tag',       color: 'text-info'},
    'active':         {icon: 'icon icon-tag',       color: 'text-info'},
  }
});

export default Machine;
