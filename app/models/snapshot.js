import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { denormalizeId } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  type: 'snapshot',
  modalService: Ember.inject.service('modal'),

  volume: denormalizeId('volumeId'),

  hasBackups: Ember.computed.notEmpty('backupTargetId'),
  backupEnabled: Ember.computed.empty('backupTargetId'),

  actions: {
    backup() {
      this.get('store').findAll('backuptarget').then((backupTargets) => {
        this.get('modalService').toggleModal('modal-edit-backup', {
          originalModel: this,
          backupTargets: backupTargets
        });
      });
    },

    revertToSnapshot() {
      this.get('volume').doAction('reverttosnapshot', {
        snapshotId: this.get('id'),
      });
    },

    //restoreFromBackup() {
      //this.get('volume').doAction('restorefrombackup', {
        //backupId: this.get('latestCompleteBackup.id'),
      //});
    //},

    deleteBackup() {
      this.doAction('removebackup');
    },
  },

  availableActions: function() {
    var a = this.get('actionLinks');
    var volA = this.get('volume.actionLinks');

    let created = this.get('state') === 'snapshotted';

    return [
      { label: 'action.remove',       icon: 'icon icon-trash',        action: 'promptDelete',     enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.revertToSnapshot', icon: 'icon icon-history',  action: 'revertToSnapshot', enabled: created && volA && !!volA.reverttosnapshot },
      { label: 'action.restoreFromBackup', icon: 'icon icon-history', action: 'restoreFromBackup', enabled: created && volA && this.get('hasBackups') && !!volA.restorefrombackup },
      { label: 'action.backup',       icon: 'icon icon-hdd',          action: 'backup',           enabled: created && this.get('backupEnabled') },
      { label: 'action.deleteBackup', icon: 'icon icon-hdd',          action: 'deleteBackup',     enabled: this.get('hasBackups') },
      { label: 'action.viewInApi',    icon: 'icon icon-external-link',action: 'goToApi',          enabled: true },
    ];
  }.property('actionLinks.remove','backupEnabled','hasBackups','volume.actionLinks.reverttosnapshot','state','volume.state'),
});
