import Cattle from 'ui/utils/cattle';

var pendingStates = [
  'requested',
  'bootstrapping',
  'creating',
  'created',
  'erroring',
  'error',
  'updating'
];

var Machine = Cattle.TransitioningResource.extend({
  type: 'machine',
  reservedKeys: ['hostsUpdated','hosts','isPending'],

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
});

export default Machine;
