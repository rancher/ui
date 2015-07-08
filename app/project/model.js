import Resource from 'ember-api-store/models/resource';
import Ember from 'ember';
import C from 'ui/utils/constants';

var Project = Resource.extend({
  session: Ember.inject.service(),
  prefs: Ember.inject.service(),

  type: 'project',
  name: null,
  description: null,
  externalId: null,
  externalIdType: null,

  isUser:     Ember.computed.equal('externalIdType', C.PROJECT.TYPE_USER),
  isTeam:     Ember.computed.equal('externalIdType', C.PROJECT.TYPE_TEAM),
  isOrg:      Ember.computed.equal('externalIdType', C.PROJECT.TYPE_ORG),

  icon: function() {
    if ( this.get('isDefault') )
    {
      return 'ss-home';
    }
    else if ( this.get('active') )
    {
      return 'ss-openfolder';
    }
    else
    {
      return 'ss-folder';
    }
  }.property('active','isDefault'),

  isDefault: function() {
    return this.get('prefs.' + C.PREFS.PROJECT_DEFAULT) === this.get('id');
  }.property('prefs.' + C.PREFS.PROJECT_DEFAULT, 'id'),

  active: function() {
    return this.get('session.' + C.SESSION.PROJECT) === this.get('id');
  }.property('session' + C.SESSION.PROJECT, 'id'),

  canRemove: function() {
    return !!this.get('actions.remove') && ['removing','removed','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state','actions.remove'),

  canSetDefault: function() {
    return this.get('state') === 'active' && !this.get('isDefault');
  }.property('state','isDefault'),
});

// Projects don't get pushed by /subscribe WS, so refresh more often
Project.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,

  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  },

  stateMap: {
    'activating':       {icon: 'ss-tag',          color: 'text-danger'},
    'active':           {icon: 'ss-record',       color: 'text-success'},
    'deactivating':     {icon: 'fa fa-adjust',    color: 'text-danger'},
    'inactive':         {icon: 'fa fa-circle',    color: 'text-danger'},
    'purged':           {icon: 'ss-tornado',      color: 'text-danger'},
    'purging':          {icon: 'ss-tornado',      color: 'text-danger'},
    'registering':      {icon: 'ss-tag',          color: 'text-danger'},
    'removed':          {icon: 'ss-trash',        color: 'text-danger'},
    'removing':         {icon: 'ss-trash',        color: 'text-danger'},
    'requested':        {icon: 'ss-ticket',       color: 'text-danger'},
    'restoring':        {icon: 'ss-medicalcross', color: 'text-danger'},
    'updating-active':  {icon: 'ss-record',       color: 'text-success'},
    'updating-inactive':{icon: 'ss-alert',        color: 'text-danger'},
  }
});

export default Project;
