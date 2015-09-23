import Ember from 'ember';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';

var CertificateController = Ember.Controller.extend(CattleTransitioningController, {
  needs: ['application'],

  availableActions: function() {
    var a = this.get('model.actions');
    if ( !a )
    {
      return [];
    }

    var choices = [
      { label: 'Delete',        icon: 'icon icon-trash',          action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { label: 'Restore',       icon: 'icon icon-medicalcross',   action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: '',                         action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'View in API',   icon: 'icon icon-externallink',   action: 'goToApi',      enabled: true },
    ];

    return choices;
  }.property('model.actions.{remove,restore,purge,update}'),
});

CertificateController.reopenClass({
});

export default CertificateController;
