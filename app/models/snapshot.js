import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
const { getOwner } = Ember;

// !! If you add a new one of these, you need to add it to reset() below too
var _allVolumes;
// !! If you add a new one of these, you need to add it to reset() below too

var Snapshot = Resource.extend({
  type: 'snapshot',
  modalService: Ember.inject.service('modal'),

  // !! If you add a new one of these, you need to add it to reset() below too
  _allVolumes: null,

  reservedKeys: [
    '_allVolumes',
  ],

  init: function() {
    this._super();

    // this.get('store') isn't set yet at init
    var store = getOwner(this).lookup('store:main');

    if ( !_allVolumes )
    {
      _allVolumes = store.allUnremoved('volume');
    }

    this.setProperties({
      '_allVolumes': _allVolumes,
    });
  },
  // !! If you add a new one of these, you need to add it to reset() below too

  actions: {
    backup() {
      this.get('store').findAllUnremoved('backuptarget').then((backupTargets) => {
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

  volume: function() {
    return this.get('_allVolumes').filterBy('id', this.get('volumeId'))[0];
  }.property('_allVolumes.@each.volumeId','id'),

  hasBackups: Ember.computed.notEmpty('backupTargetId'),
  backupEnabled: Ember.computed.empty('backupTargetId'),

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

Snapshot.reopenClass({
  reset: function() {
    _allVolumes = null;
  }
});

export default Snapshot;
