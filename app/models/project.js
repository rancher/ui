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
      this.get('router').transitionTo('settings.projects.detail', this.get('id'), {queryParams: {editing: true}});
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

    promptStop: function() {
      this.get('application').setProperties({
        showConfirmDeactivate : true,
        originalModel         : this,
        action                : 'deactivate'
      });
    },

  },

  availableActions: function() {
    var a = this.get('actionLinks');

    var choices = [
      {label: 'Switch to this Environment', icon: 'icon icon-folder-open',  action: 'switchTo',     enabled: this.get('canSwitchTo')},
      {label: 'Set as login default',       icon: 'icon icon-home',         action: 'setAsDefault', enabled: this.get('canSetDefault')},
      { divider: true },
      { label: 'Edit',                      icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update },
      { label: 'Activate',                  icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate},
      { label: 'Deactivate',                icon: 'icon icon-pause',        action: 'promptStop',   enabled: !!a.deactivate,        altAction: 'deactivate'},
      { divider: true },
      { label: 'Delete',                    icon: 'icon icon-trash',        action: 'promptDelete', enabled: this.get('canRemove'), altAction: 'delete' },
      { label: 'Restore',                   icon: '',                       action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',                     icon: '',                       action: 'purge',        enabled: !!a.purge },
    ];


    return choices;
  }.property('actionLinks.{activate,deactivate,update,restore,purge}','state','canRemove','canSetDefault','canSwitchTo'),

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

  canSwitchTo: function() {
    return this.get('state') === 'active' && this.get('id') !== this.get('projects.current.id');
  }.property('id','projects.current.id','state'),

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
      return 'Cattle';
    }
  }.property('kubernetes','swarm'),
});

// Projects don't get pushed by /subscribe WS, so refresh more often
Project.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Project;
