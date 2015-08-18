import Ember from 'ember';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';
import C from 'ui/utils/constants';

var CertificateController = Ember.Controller.extend(CattleTransitioningController, {
  needs: ['application'],

  availableActions: function() {
    var a = this.get('model.actions');
    if ( !a )
    {
      return [];
    }

    var choices = [
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { label: 'Restore',       icon: 'ss-medicalcross',     action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: 'ss-tornado',          action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'View in API',   icon: 'fa fa-external-link', action: 'goToApi',      enabled: true },
//      { label: 'Clone to Service', icon: 'ss-copier',           action: 'cloneToService', enabled: !isSystem && !isService },
      { label: 'Edit',          icon: 'ss-write',            action: 'edit',         enabled: !!a.update },
    ];

    return choices;
  }.property('model.actions.{remove,restore,purge,update}'),
});

CertificateController.reopenClass({
});

export default CertificateController;
