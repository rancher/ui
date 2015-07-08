import Ember from 'ember';
import C from 'ui/utils/constants';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';

export default Ember.Controller.extend(CattleTransitioningController, {
  prefs: Ember.inject.service(),
  projects: Ember.inject.service(),

  actions: {
    edit: function() {
      this.get('controllers.application').setProperties({
        editProject: true,
        originalModel: this.get('model'),
      });
    },

    delete: function() {
      return this.delete().then(() => {
        // If you're in the project that was deleted, go back to the default project
        if ( this.get('model.id') === this.get('session.'+ C.SESSION.PROJECT) )
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
        if ( this.get('model.id') === this.get('session.'+ C.SESSION.PROJECT) )
        {
          window.location.href = window.location.href;
        }
      });
    },

    setAsDefault: function() {
      this.get('prefs').set(C.PREFS.PROJECT_DEFAULT, this.get('model.id'));
    },

    switchTo: function(parentController) {
      parentController.send('switchProject', this.get('model.id'));
    },
  },

  availableActions: function() {
    var a = this.get('model.actions');

    var choices = [
      { label: 'Activate',      icon: 'ss-play',  action: 'activate',     enabled: !!a.activate},
      { label: 'Deactivate',    icon: 'ss-pause', action: 'deactivate',     enabled: !!a.deactivate},
      { label: 'Delete',        icon: 'ss-trash', action: 'promptDelete', enabled: this.get('model.canRemove'), altAction: 'delete' },
      { divider: true },
      { label: 'Restore',       icon: '',         action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: '',         action: 'purge',        enabled: !!a.purge },
      { label: 'Edit',          icon: '',         action: 'edit',         enabled: !!a.update },
    ];

    choices.pushObject({label: 'Switch to this Environment', icon: '', action: 'switchTo', enabled: this.get('model.state') === 'active' });
    choices.pushObject({label: 'Set as default login Environment', icon: '', action: 'setAsDefault', enabled: this.get('model.canSetDefault')});

    return choices;
  }.property('model.actions.{activate,deactivate,update,restore,purge}','model.{state,canRemove,canSetDefault}'),
});
