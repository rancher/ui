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
    var icon = 'fa-question-circle';

    switch ( this.get('externalIdType') )
    {
      case C.PROJECT_TYPE_DEFAULT:  icon = 'fa-home';     break;
      case C.PROJECT_TYPE_USER:     icon = 'fa-github';   break;
      case C.PROJECT_TYPE_TEAM:     icon = 'fa-users';    break;
      case C.PROJECT_TYPE_ORG:      icon = 'fa-building'; break;
    }

    return icon;
  }.property('externalIdType'),

  listIcon: function() {
    if ( this.get('active') )
    {
      return 'fa-check';
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
      { label: 'Edit',          icon: 'fa-edit',          action: 'edit',         enabled: !!a.update },
      { label: 'Activate',      icon: 'fa-arrow-up',      action: 'activate',     enabled: !!a.activate},
      { label: 'Restore',       icon: 'fa-ambulance',     action: 'restore',      enabled: !!a.restore },
      { label: 'Delete',        icon: 'fa-trash-o',       action: 'promptDelete', enabled: this.get('canRemove'), altAction: 'delete' },
      { label: 'Purge',         icon: 'fa-fire',          action: 'purge',        enabled: !!a.purge },
    ];

    return choices;
  }.property('actions.{update,restore,remove,purge}','canRemove'),
});

ProjectController.reopenClass({
  stateMap: {
    'activating':       {icon: 'fa-ticket',       color: 'text-danger'},
    'active':           {icon: 'fa-circle-o',     color: 'text-success'},
    'deactivating':     {icon: 'fa-adjust',       color: 'text-danger'},
    'inactive':         {icon: 'fa-stop',         color: 'text-danger'},
    'purged':           {icon: 'fa-fire',         color: 'text-danger'},
    'purging':          {icon: 'fa-fire',         color: 'text-danger'},
    'registering':      {icon: 'fa-ticket',       color: 'text-danger'},
    'removed':          {icon: 'fa-trash',        color: 'text-danger'},
    'removing':         {icon: 'fa-trash',        color: 'text-danger'},
    'requested':        {icon: 'fa-ticket',       color: 'text-danger'},
    'restoring':        {icon: 'fa-trash',        color: 'text-danger'},
    'updating-active':  {icon: 'fa-circle-o',     color: 'text-success'},
    'updating-inactive':{icon: 'fa-warning',      color: 'text-danger'},
  }
});

export default ProjectController;
