import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
const { getOwner } = Ember;

// !! If you add a new one of these, you need to add it to reset() below too
var _allBackups;
// !! If you add a new one of these, you need to add it to reset() below too

var Snapshot = Resource.extend({
  type: 'snapshot',

  // !! If you add a new one of these, you need to add it to reset() below too
  _allBackups: null,

  reservedKeys: [
    '_allBackups',
  ],

  init: function() {
    this._super();

    // this.get('store') isn't set yet at init
    var store = getOwner(this).lookup('store:main');
    if ( !_allBackups )
    {
      _allBackups = store.allUnremoved('backup');
    }

    this.setProperties({
      '_allBackups': _allBackups,
    });
  },
  // !! If you add a new one of these, you need to add it to reset() below too

  actions: {
    backup() {
      let backupTargets = this.get('store').find('backuptarget').then((backupTargets) => {// jshint ignore:line
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

    return [
      { label: 'action.remove',       icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.backup',       icon: 'icon icon-hdd',          action: 'backup',       enabled: this.get('backupEnabled') },
      { label: 'action.deleteBackup', icon: 'icon icon-hdd',          action: 'deleteBackup', enabled: !this.get('backupEnabled') },
      { label: 'action.viewInApi',    icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }.property('actionLinks.remove','backupEnabled'),
});

Snapshot.reopenClass({
  reset: function() {
    _allBackups = null;
  }
});

export default Snapshot;
