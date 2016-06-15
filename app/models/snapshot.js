import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
const { getOwner } = Ember;

// !! If you add a new one of these, you need to add it to reset() below too
var _allBackups;
var _allVolumes;
// !! If you add a new one of these, you need to add it to reset() below too

var Snapshot = Resource.extend({
  type: 'snapshot',

  // !! If you add a new one of these, you need to add it to reset() below too
  _allBackups: null,
  _allVolumes: null,

  reservedKeys: [
    '_allBackups',
    '_allVolumes',
  ],

  init: function() {
    this._super();

    // this.get('store') isn't set yet at init
    var store = getOwner(this).lookup('store:main');
    if ( !_allBackups )
    {
      _allBackups = store.allUnremoved('backup');
    }

    if ( !_allVolumes )
    {
      _allVolumes = store.allUnremoved('volume');
    }

    this.setProperties({
      '_allBackups': _allBackups,
      '_allVolumes': _allVolumes,
    });
  },
  // !! If you add a new one of these, you need to add it to reset() below too

  actions: {
    backup() {
      this.get('store').find('backuptarget').then((backupTargets) => {
        this.get('application').setProperties({
          editBackup: true,
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

    restoreFromBackup() {
      this.get('volume').doAction('restorefrombackup', {
        backupId: this.get('latestCompleteBackup.id'),
      });
    },

    deleteBackup() {
      this.get('latestBackup').doAction('remove');
    },
  },

  volume: function() {
    return this.get('_allVolumes').filterBy('id', this.get('volumeId'))[0];
  }.property('_allVolumes.@each.volumeId','id'),

  backups: function() {
    return this.get('_allBackups').filterBy('snapshotId', this.get('id'));
  }.property('_allBackups.@each.snapshotId','id'),

  latestBackup: function() {
    return this.get('backups').sortBy('id').pop();
  }.property('backups.@each.id'),

  latestCompleteBackup: function() {
    return this.get('backups').filterBy('state','created').sortBy('id').pop();
  }.property('backups.@each.{id,state}'),

  backupCount: Ember.computed.alias('backups.length'),
  hasBackups: Ember.computed.gte('backupCount',1),
  backupEnabled: Ember.computed.equal('backupCount', 0),

  availableActions: function() {
    var a = this.get('actionLinks');
    var volA = this.get('volume.actionLinks');

    let created = this.get('state') === 'created';
    let backedup = !!this.get('latestCompleteBackup');

    return [
      { label: 'action.remove',       icon: 'icon icon-trash',        action: 'promptDelete',     enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.revertToSnapshot', icon: 'icon icon-history',  action: 'revertToSnapshot', enabled: created && volA && !!volA.reverttosnapshot },
      { label: 'action.restoreFromBackup', icon: 'icon icon-history', action: 'restoreFromBackup', enabled: created && volA && backedup && !!volA.restorefrombackup },
      { label: 'action.backup',       icon: 'icon icon-hdd',          action: 'backup',           enabled: created && this.get('backupEnabled') },
      { label: 'action.deleteBackup', icon: 'icon icon-hdd',          action: 'deleteBackup',     enabled: this.get('hasBackups') },
      { label: 'action.viewInApi',    icon: 'icon icon-external-link',action: 'goToApi',          enabled: true },
    ];
  }.property('actionLinks.remove','backupEnabled','hasBackups','latestCompleteBackup','volume.actionLinks.reverttosnapshot','state'),
});

Snapshot.reopenClass({
  reset: function() {
    _allBackups = null;
    _allVolumes = null;
  }
});

export default Snapshot;
