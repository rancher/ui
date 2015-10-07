import Ember from 'ember';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';

export default Ember.Controller.extend(CattleTransitioningController, {
  availableActions: function() {
    var a = this.get('model.actionLinks');

    return [
      { label: 'Delete',        icon: 'icon icon-trash', action: 'promptDelete', enabled: this.get('model.canDelete'), altAction: 'delete' },
      { divider: true },
      { label: 'Restore',       icon: '',                action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: '',                action: 'purge',        enabled: !!a.purge },
    ];
  }.property('model.actionLinks.{restore,purge}','model.canDelete'),
});
