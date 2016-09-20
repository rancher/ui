import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
const { getOwner } = Ember;

// !! If you add a new one of these, you need to add it to reset() below too
var _allMounts;
var _allSnapshots;
// !! If you add a new one of these, you need to add it to reset() below too

var Volume = Resource.extend({
  type: 'volume',
  modalService: Ember.inject.service('modal'),

  // !! If you add a new one of these, you need to add it to reset() below too
  _allMounts: null,
  _allSnapshots: null,

  reservedKeys: [
    '_allMounts',
    '_allSnapshots',
  ],

  init: function() {
    this._super();

    // this.get('store') isn't set yet at init
    var store = getOwner(this).lookup('store:main');
    if ( !_allMounts )
    {
      _allMounts = store.allUnremoved('mount');
    }

    if ( !_allSnapshots )
    {
      _allSnapshots = store.allUnremoved('snapshot');
    }

    this.setProperties({
      '_allMounts': _allMounts,
      '_allSnapshots': _allSnapshots,
    });
  },
  // !! If you add a new one of these, you need to add it to reset() below too

  actions: {
    snapshot() {
      this.get('modalService').toggleModal('modal-edit-snapshot', this);
      this.get('application').setProperties({
        editSnapshot: true,
        originalModel: this,
      });
    },
  },

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'action.remove',           icon: 'icon icon-trash',          action: 'promptDelete',      enabled: this.get('canDelete'), altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',  action: 'goToApi',           enabled: true },
      { label: 'action.restore',          icon: '',                         action: 'restore',           enabled: !!a.restore },
      { label: 'action.purge',            icon: '',                         action: 'purge',             enabled: !!a.purge },
      { label: 'action.snapshot',         icon: 'icon icon-copy',           action: 'snapshot',          enabled: !!a.snapshot },
    ];
  }.property('actionLinks.{restore,purge}','model.canDelete'),

  displayUri: function() {
    return (this.get('uri')||'').replace(/^file:\/\//,'');
  }.property('uri'),

  isRoot: Ember.computed.notEmpty('instanceId'),

  canDelete: function() {
    return ['inactive', 'requested'].indexOf(this.get('state')) >= 0 && !this.get('isRoot');
  }.property('state','isRoot'),

  mounts: function() {
    return this.get('_allMounts').filterBy('volumeId', this.get('id'));
  }.property('_allMounts.@each.volumeId','id'),

  activeMounts: function() {
    var mounts = this.get('mounts')||[];
    return mounts.filter(function(mount) {
      return ['removed','purged', 'inactive'].indexOf(mount.get('state')) === -1;
    });
  }.property('mounts.@each.state'),

  snapshots: function() {
    return this.get('_allSnapshots').filterBy('volumeId', this.get('id'));
  }.property('_allSnapshots.@each.volumeId','id'),
});

Volume.reopenClass({
  reset: function() {
    _allMounts = null;
    _allSnapshots = null;
  },

  stateMap: {
    'active':           {icon: 'icon icon-hdd',    color: 'text-success'},
  },
});

export default Volume;
