import Ember from 'ember';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';

export default Ember.Controller.extend(CattleTransitioningController, {
  actions: {
    deactivate: function() {
      return this.get('model').doAction('deactivate');
    },

    activate: function() {
      return this.get('model').doAction('activate');
    },

    edit: function() {
      this.get('controllers.application').setProperties({
        editApikey: true,
        editApikeyIsNew: false,
        originalModel: this.get('model'),
      });
    },
  },

  availableActions: function() {
    var a = this.get('model.actions');

    return [
      { label: 'Activate',      icon: 'icon icon-play',   action: 'activate',     enabled: !!a.activate },
      { label: 'Deactivate',    icon: 'icon icon-pause',  action: 'deactivate',   enabled: !!a.deactivate },
      { label: 'Delete',        icon: 'icon icon-trash',  action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'Purge',         icon: '',                 action: 'purge',        enabled: !!a.purge },
      { label: 'Restore',       icon: '',                 action: 'restore',      enabled: !!a.restore },
      { divider: true },
      { label: 'Edit',          icon: 'icon icon-edit',   action: 'edit',         enabled: !!a.update },
    ];
  }.property('model.actions.{update,activate,deactivate,restore,remove,purge}'),
});
