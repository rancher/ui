import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';
import Ember from 'ember';
import C from 'ui/utils/constants';

var Project = Resource.extend(PolledResource, {
  prefs: Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),

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
        if ( this.get('active') )
        {
          window.location.href = window.location.href;
        }
      });
    },

    activate: function() {
      return this.doAction('activate').then(() => {
        return this.waitForState('active').then(() => {
          this.get('projects').refreshAll();
        });
      });
    },

    deactivate: function() {
      return this.doAction('deactivate').then(() => {
        if ( this.get('active') )
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
     return ( this.get('id') === this.get(`tab-session.${C.TABSESSION.PROJECT}`) );
  }.property(`tab-session.${C.TABSESSION.PROJECT}`, 'id'),

  canRemove: function() {
    return !!this.get('actionLinks.remove') && ['removing','removed','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state','actionLinks.remove'),

  canSetDefault: function() {
    return this.get('state') === 'active' && !this.get('isDefault');
  }.property('state','isDefault'),

  displayOrchestration: function() {
    if ( this.get('kubernetes') )
    {
      return 'Kubernetes';
    }
    else if ( this.get('swarm') )
    {
      return 'Swarm';
    }
    else
    {
      return 'Corral';
    }
  }.property('kubernetes','swarm'),
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
