import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { denormalizeIdArray } from 'ember-api-store/utils/denormalize';

var Volume = Resource.extend({
  type: 'volume',
  modalService: Ember.inject.service('modal'),

  mounts: denormalizeIdArray('mountIds'),
  snapshots: denormalizeIdArray('snapshotIds'),

  isRoot: Ember.computed.notEmpty('instanceId'),

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
      { label: 'action.remove',           icon: 'icon icon-trash',          action: 'promptDelete',      enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',  action: 'goToApi',           enabled: true },
      { label: 'action.restore',          icon: '',                         action: 'restore',           enabled: !!a.restore },
      { label: 'action.purge',            icon: '',                         action: 'purge',             enabled: !!a.purge },
      { label: 'action.snapshot',         icon: 'icon icon-copy',           action: 'snapshot',          enabled: !!a.snapshot },
    ];
  }.property('actionLinks.{restore,purge,remove}'),

  displayUri: function() {
    return (this.get('uri')||'').replace(/^file:\/\//,'');
  }.property('uri'),

  activeMounts: function() {
    var mounts = this.get('mounts')||[];
    return mounts.filter(function(mount) {
      return ['removed','purged', 'inactive'].indexOf(mount.get('state')) === -1;
    });
  }.property('mounts.@each.state'),
});

Volume.reopenClass({
  stateMap: {
    'active':           {icon: 'icon icon-hdd',    color: 'text-success'},
  },
});

export default Volume;
