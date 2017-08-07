import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';
import Ember from 'ember';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

var Project = Resource.extend(PolledResource, {
  access: Ember.inject.service(),
  prefs: Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),

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
      this.get('modalService').toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action: 'deactivate'
      });
    },

  },

  availableActions: function() {
    var a = this.get('actionLinks');

    var choices = [
      { label: 'action.setDefault',       icon: 'icon icon-home',         action: 'setAsDefault', enabled: this.get('canSetDefault')},
      { divider: true },
      { label: 'action.edit',             icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update },
      { divider: true },
      { label: 'action.activate',         icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate},
      { label: 'action.deactivate',       icon: 'icon icon-pause',        action: 'promptStop',   enabled: !!a.deactivate,        altAction: 'deactivate'},
      { divider: true },
      { label: 'action.remove',           icon: 'icon icon-trash',        action: 'promptDelete', enabled: this.get('canRemove'), altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];


    return choices;
  }.property('actionLinks.{activate,deactivate,update}','state','canRemove','canSetDefault','canSwitchTo'),

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
    return Util.ucFirst(this.get('orchestration'));
  }.property('orchestration'),

  isWindows: Ember.computed.equal('orchestration','windows'),
});

// Projects don't get pushed by /subscribe WS, so refresh more often
Project.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Project;
