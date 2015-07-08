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
      { label: 'Activate',      icon: 'ss-play',  action: 'activate',     enabled: !!a.activate },
      { label: 'Deactivate',    icon: 'ss-pause', action: 'deactivate',   enabled: !!a.deactivate },
      { label: 'Delete',        icon: 'ss-trash', action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'Purge',         icon: 'ss-tornado',           action: 'purge',   enabled: !!a.purge },
      { label: 'Restore',       icon: 'ss-medicalcross',      action: 'restore', enabled: !!a.restore },
      { label: 'View in API',   icon: 'fa fa-external-link',  action: 'goToApi', enabled: true },
      { divider: true },
      { label: 'Edit',          icon: 'ss-write', action: 'edit',         enabled: !!a.update },
    ];
  }.property('model.actions.{update,activate,deactivate,restore,remove,purge}'),

});
