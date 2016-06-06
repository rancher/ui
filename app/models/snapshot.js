import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var Snapshot = Resource.extend({
  type: 'snapshot',

  backupCount: null,
  latestBackup: null,
  backups: null,

  actions: {
    backup() {
      let backupTargets = this.get('store').find('backupTargets').then((backupTargets) => {// jshint ignore:line
        this.get('application').setProperties({
          editBackup: true,
          originalModel: this,
          backupTargets: backupTargets
        });
      });
    },
    deleteBackup() {
      this.get('latestBackup').doAction('remove');
    },
  },

  hasBackups: Ember.computed('store.backups.[]', function() {
    let backups = this.get('store').allUnremoved('backup').content;
    let snapshotBackups = this.get('backups');

    if (!snapshotBackups) {
      snapshotBackups = [];
    }

    backups.forEach((bu) => {
      if (bu.snapshotId === this.get('id')) {
        this.incrementProperty('backupCount');
        //push backups into the snapshot model
        snapshotBackups.push(bu);
      }
    });

    if (snapshotBackups) {
      if (snapshotBackups.length > 1) {
        this.set('latestBackup', snapshotBackups[0]);
      }
      return true;
    }

    return false;
  }),

  backupEnabled: Ember.computed('backupCount', function() {
    if (this.get('backupCount') > 1) {
      return false;
    }
    return true;
  }),

  availableActions: function() {
    return [
      { label: 'action.remove',    icon: 'icon icon-trash',        action: 'promptDelete', enabled: this.get('canDelete'), altAction: 'delete' },
      { divider: true },
      { label: 'action.backup',    icon: 'icon icon-hdd',          action: 'backup',       enabled: this.get('backupEnabled') },
      { label: 'action.deleteBackup',    icon: 'icon icon-hdd',          action: 'deleteBackup',       enabled: !this.get('backupEnabled') },
      { label: 'action.viewInApi', icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }.property('actionLinks.{restore,purge}','model.canDelete'),
});

Snapshot.reopenClass({
  alwaysInclude: ['backups'],
});

export default Snapshot;
