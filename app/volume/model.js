import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var Volume = Resource.extend({
  type: 'volume',
  displayUri: function() {
    return (this.get('uri')||'').replace(/^file:\/\//,'');
  }.property('uri'),

  isRoot: Ember.computed.notEmpty('instanceId'),

  canDelete: function() {
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
   'active':    {icon: 'ss-record',   color: 'text-success'},
   'inactive':  {icon: 'fa fa-circle',color: 'text-danger'},
   'removed':   {icon: 'ss-trash',    color: 'text-danger'},
   'purged':    {icon: 'ss-tornado',  color: 'text-danger'}
  },

});

export default Volume;
