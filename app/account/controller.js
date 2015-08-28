import Ember from 'ember';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';

export default Ember.Controller.extend(CattleTransitioningController, {
  actions: {
    deactivate() {
      return this.get('model').doAction('deactivate');
    },

    activate() {
      return this.get('model').doAction('activate');
    },

    edit: function() {
      this.get('controllers.application').setProperties({
        editAccount: true,
        originalModel: this.get('model'),
      });
    },
  },

  availableActions: function() {
    var a = this.get('model.actions');

    return [
      { label: 'Activate',      icon: 'ss-play',             action: 'activate',     enabled: !!a.activate },
      { label: 'Deactivate',    icon: 'ss-pause',            action: 'deactivate',   enabled: !!a.deactivate },
      { label: 'Delete',        icon: 'ss-trash',            action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'Purge',         icon: '',                    action: 'purge',        enabled: !!a.purge },
      { label: 'Restore',       icon: '',                    action: 'restore',      enabled: !!a.restore },
      { divider: true },
      { label: 'Edit',          icon: '',                    action: 'edit',         enabled: !!a.update },
      { label: 'View in API',   icon: 'fa fa-external-link', action: 'goToApi',      enabled: true },
    ];
  }.property('model.actions.{update,activate,deactivate,restore,remove,purge}'),
});
