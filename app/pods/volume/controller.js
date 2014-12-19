import Cattle from 'ui/utils/cattle';
import Ember from 'ember';

var VolumeController = Cattle.TransitioningResourceController.extend({
  icon: 'fa-database',

  actions: {
    delete: function() {
      return this.delete();
    },

    purge: function() {
      return this.doAction('purge');
    },

    restore: function() {
      return this.doAction('restore');
    },

    promptDelete: function() {
      this.transitionToRoute('volume.delete', this.get('model'));
    },
  },

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

VolumeController.reopenClass({
  stateMap: {
   'active':    {icon: 'fa-circle-o', color: 'text-info'},
   'inactive':  {icon: 'fa-circle',   color: 'text-danger'},
   'removed':   {icon: 'fa-trash',    color: 'text-danger'},
   'purged':    {icon: 'fa-fire',     color: 'text-danger'}
  },
});

export default VolumeController;
