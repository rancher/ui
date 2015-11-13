import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';
import Ember from 'ember';
import C from 'ui/utils/constants';

var Project = Resource.extend(PolledResource, {
  session: Ember.inject.service(),
  prefs: Ember.inject.service(),

  type: 'project',
  name: null,
  description: null,

  actions: {
    edit: function() {
      this.importLink('projectMembers').then(() => {
        this.get('application').setProperties({
          editProject: true,
          originalModel: this,
        });
      });
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
        this.get('projects').refreshAll();
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
      // @TODO bad
      window.lc('authenticated').send('switchProject', this.get('id'));
    },
  },

  availableActions: function() {
    var a = this.get('actionLinks');

    var choices = [
      { label: 'Activate',      icon: 'icon icon-play',  action: 'activate',     enabled: !!a.activate},
      { label: 'Deactivate',    icon: 'icon icon-pause', action: 'deactivate',   enabled: !!a.deactivate},
      { label: 'Delete',        icon: 'icon icon-trash', action: 'promptDelete', enabled: this.get('canRemove'), altAction: 'delete' },
      { divider: true },
      { label: 'Restore',       icon: '',                action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: '',                action: 'purge',        enabled: !!a.purge },
      { label: 'Edit',          icon: 'icon icon-edit',  action: 'edit',         enabled: !!a.update },
    ];

    choices.pushObject({label: 'Switch to this Environment', icon: '', action: 'switchTo', enabled: this.get('state') === 'active' });
    choices.pushObject({label: 'Set as default login Environment', icon: '', action: 'setAsDefault', enabled: this.get('canSetDefault')});

    return choices;
  }.property('actionLinks.{activate,deactivate,update,restore,purge}','state','canRemove','canSetDefault'),

  icon: function() {
    if ( this.get('isDefault') )
    {
      return 'icon icon-home';
    }
    else if ( this.get('active') )
    {
      return 'icon icon-folder-open';
    }
    else
    {
      return 'icon icon-folder';
    }
  }.property('active','isDefault'),

  isDefault: function() {
    return this.get('prefs.' + C.PREFS.PROJECT_DEFAULT) === this.get('id');
  }.property('prefs.' + C.PREFS.PROJECT_DEFAULT, 'id'),

  active: function() {
    return this.get('session.' + C.SESSION.PROJECT) === this.get('id');
  }.property('session' + C.SESSION.PROJECT, 'id'),

  canRemove: function() {
    return !!this.get('actionLinks.remove') && ['removing','removed','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state','actionLinks.remove'),

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
});

export default Project;
