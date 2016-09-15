import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
const { getOwner } = Ember;

// !! If you add a new one of these, you need to add it to reset() below too
var _allVolumes;
// !! If you add a new one of these, you need to add it to reset() below too

var Backup = Resource.extend({
  type: 'backup',

  // !! If you add a new one of these, you need to add it to reset() below too
  _allVolumes: null,

  reservedKeys: [
    '_allVolumes',
  ],

  init: function() {
    this._super();

    // this.get('store') isn't set yet at init
    var store = getOwner(this).lookup('service:store');
    if ( !_allVolumes )
    {
      _allVolumes = store.allUnremoved('volume');
    }

    this.setProperties({
      '_allVolumes': _allVolumes,
    });
  },

  volume: function() {
    return this.get('_allVolumes').filterBy('id', this.get('volumeId'))[0];
  }.property('_allVolumes.@each.volumeId','id'),

  // !! If you add a new one of these, you need to add it to reset() below too
  availableActions: function() {
    let a = this.get('actionLinks');
    var volA = this.get('volume.actionLinks');

    let created = this.get('state') === 'created';

    return [
      { label: 'action.remove',    icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { label: 'action.restoreFromBackup', icon: 'icon icon-history', action: 'restoreFromBackup', enabled: created && volA && !!volA.restorefrombackup },
      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }.property('actionLinks.remove','volume.actionLinks.restorefrombackup','state','volume.state'),

  actions: {
    restoreFromBackup() {
      this.get('volume').doAction('restorefrombackup', {
        backupId: this.get('id'),
      });
    },
  }
});

Backup.reopenClass({
  reset: function() {
    _allVolumes = null;
  }
});

export default Backup;
