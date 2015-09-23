import Ember from 'ember';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';

export default Ember.Controller.extend(CattleTransitioningController, {
  actions: {
    deactivate: function() {
      return this.doAction('deactivate');
    },

    activate: function() {
      return this.doAction('activate');
    },

    edit: function() {
      this.store.find('registry').then((registries) => {
        this.get('controllers.application').setProperties({
          editRegistry: true,
          originalModel: Ember.Object.create({
            registries: registries,
            registry: this.get('model'),
            credential: this.get('model.credential'),
          })
        });
      });
    },
  },

  availableActions: function() {
    var a = this.get('model.actions');

    return [
      { label: 'Activate',      icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate },
      { label: 'Deactivate',    icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate },
      { label: 'Delete',        icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'Purge',         icon: '',                       action: 'purge',   enabled: !!a.purge },
      { label: 'Restore',       icon: 'icon icon-medicalcross', action: 'restore', enabled: !!a.restore },
      { label: 'View in API',   icon: 'icon icon-externallink', action: 'goToApi', enabled: true },
      { divider: true },
      { label: 'Edit',          icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update },
    ];
  }.property('model.actions.{update,activate,deactivate,restore,remove,purge}'),

});
