import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import C from 'ui/utils/constants';

var ProjectController = Cattle.TransitioningResourceController.extend({
  actions: {
    edit: function() {
      this.transitionToRoute('project.edit',this.get('id'));
    },

    delete: function() {
      return this.delete().then(() => {
        if ( this.get('id') === this.get('session.projectId') )
        {
          this.send('switchProject', undefined);
        }
      });
    },

    activate: function() {
      return this.doAction('activate');
    },

    restore: function() {
      return this.doAction('restore');
    },

    purge: function() {
      return this.doAction('purge');
    },

    promptDelete: function() {
      this.transitionToRoute('project.delete', this.get('id'));
    },
  },

  isDefault:  Ember.computed.equal('externalIdType', C.PROJECT_TYPE_DEFAULT),
  isUser:     Ember.computed.equal('externalIdType', C.PROJECT_TYPE_USER),
  isTeam:     Ember.computed.equal('externalIdType', C.PROJECT_TYPE_TEAM),
  isOrg:      Ember.computed.equal('externalIdType', C.PROJECT_TYPE_ORG),

  icon: function() {
    var icon = 'ss-help';

    switch ( this.get('externalIdType') )
    {
      case C.PROJECT_TYPE_DEFAULT:  icon = 'ss-home';  break;
      case C.PROJECT_TYPE_USER:     icon = 'ss-user';  break;
      case C.PROJECT_TYPE_TEAM:     icon = 'ss-users'; break;
      case C.PROJECT_TYPE_ORG:      icon = 'ss-usergroup'; break;
    }

    return icon;
  }.property('externalIdType'),

  listIcon: function() {
    if ( this.get('active') )
    {
      return 'ss-check';
    }
    else
    {
      return this.get('icon');
    }
  }.property('icon','active'),

  githubType: function() {
    switch (this.get('externalIdType') )
    {
      case C.PROJECT_TYPE_DEFAULT: return 'user';
      case C.PROJECT_TYPE_USER: return 'user';
      case C.PROJECT_TYPE_TEAM: return 'team';
      case C.PROJECT_TYPE_ORG: return 'org';
    }
  }.property('externalIdType'),

  githubLogin: function() {
    var type = this.get('externalIdType');

    if ( type === C.PROJECT_TYPE_DEFAULT )
    {
        return this.get('session.user');
    }

    return this.get('externalId');
  }.property('externalIdType', 'externalId'),

  active: function() {
    return this.get('session.projectId') === this.get('id');
  }.property('session.projectId','id'),

  canRemove: function() {
    return ['removing','removed','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state'),

  availableActions: function() {
    var a = this.get('actions');

    var choices = [
      { label: 'Edit',          icon: 'ss-write',         action: 'edit',         enabled: !!a.update },
      { label: 'Activate',      icon: 'ss-play',          action: 'activate',     enabled: !!a.activate},
      { label: 'Restore',       icon: 'ss-medicalcross',  action: 'restore',      enabled: !!a.restore },
      { label: 'Delete',        icon: 'ss-trash',         action: 'promptDelete', enabled: this.get('canRemove'), altAction: 'delete' },
      { label: 'Purge',         icon: 'ss-tornado',       action: 'purge',        enabled: !!a.purge },
    ];

    return choices;
  }.property('actions.{update,restore,remove,purge}','canRemove'),
});

ProjectController.reopenClass({
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

export default ProjectController;
