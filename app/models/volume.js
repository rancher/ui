import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var Volume = Resource.extend({
  type: 'volume',

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'Delete',      icon: 'icon icon-trash',        action: 'promptDelete', enabled: this.get('canDelete'), altAction: 'delete' },
      { divider: true },
      { label: 'View in API', icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
      { label: 'Restore',     icon: '',                       action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',       icon: '',                       action: 'purge',        enabled: !!a.purge },
    ];
  }.property('actionLinks.{restore,purge}','model.canDelete'),

  displayUri: function() {
    return (this.get('uri')||'').replace(/^file:\/\//,'');
  }.property('uri'),

  isRoot: Ember.computed.notEmpty('instanceId'),

  canDelete: function() {
    // This doesn't work in the API yet.
    if ( true )
    {
      return false;
    }

    // Can't delete things that are already removed, or root volumes (with an instanceId)
    if ( this.get('isDeleted') || this.get('isPurged') || this.get('isRoot') )
    {
      return false;
    }

    return this.get('activeMounts.length') === 0;
  }.property('isDeleted','isPurged','isRoot','activeMounts.length'),

  activeMounts: function() {
    var mounts = this.get('mounts')||[];
    return mounts.filter(function(mount) {
      return ['removed','purged'].indexOf(mount.get('state')) === -1;
    });
  }.property('mounts.[]','mounts.@each.state')
});

Volume.reopenClass({
  alwaysInclude: ['mounts'],
  stateMap: {
    'active':           {icon: 'icon icon-hdd',    color: 'text-success'},
  },
});

export default Volume;
