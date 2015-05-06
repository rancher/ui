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
        // If you're in the project that was deleted, go back to the default project
        if ( this.get('id') === this.get('session.'+ C.SESSION.PROJECT) )
        {
          window.location.href = window.location.href;
        }
      });
    },

    activate: function() {
      return this.doAction('activate').then(() => {
        this.send('refreshProjectDropdown');
      });
    },

    deactivate: function() {
      return this.doAction('deactivate').then(() => {
        if ( this.get('id') === this.get('session.'+ C.SESSION.PROJECT) )
        {
          window.location.href = window.location.href;
        }
      });
    },

    setAsDefault: function() {
      this.get('prefs').set(C.PREFS.PROJECT_DEFAULT, this.get('id'));
    },

    switchTo: function() {
      this.send('switchProject', this.get('id'));
    },
  },

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

  availableActions: function() {
    var a = this.get('actions');

    var choices = [
      { label: 'Activate',      icon: 'ss-play',  action: 'activate',     enabled: !!a.activate},
      { label: 'Deactivate',    icon: 'ss-pause', action: 'deactivate',     enabled: !!a.deactivate},
      { label: 'Delete',        icon: 'ss-trash', action: 'promptDelete', enabled: this.get('canRemove'), altAction: 'delete' },
      { divider: true },
      { label: 'Restore',       icon: '',         action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: '',         action: 'purge',        enabled: !!a.purge },
      { label: 'Edit',          icon: '',         action: 'edit',         enabled: !!a.update },
    ];

    choices.pushObject({label: 'Switch to this Project', icon: '', action: 'switchTo', enabled: this.get('state') === 'active' });
    choices.pushObject({label: 'Set as my default Project', icon: '', action: 'setAsDefault', enabled: this.get('canSetDefault')});

    return choices;
  }.property('actions.{activate,deactivate,update,restore,purge}','canRemove','canSetDefault'),
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
