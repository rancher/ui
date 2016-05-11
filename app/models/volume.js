import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var Volume = Resource.extend({
  type: 'volume',

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'action.remove',    icon: 'icon icon-trash',        action: 'promptDelete', enabled: this.get('canDelete'), altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
      { label: 'action.restore',   icon: '',                       action: 'restore',      enabled: !!a.restore },
      { label: 'action.purge',     icon: '',                       action: 'purge',        enabled: !!a.purge },
    ];
  }.property('actionLinks.{restore,purge}','model.canDelete'),

  displayUri: function() {
    return (this.get('uri')||'').replace(/^file:\/\//,'');
  }.property('uri'),

  isRoot: Ember.computed.notEmpty('instanceId'),

  canDelete: function() {
    return ['inactive', 'requested'].indexOf(this.get('state')) >= 0 && !this.get('isRoot');
  }.property('state','isRoot'),

  activeMounts: function() {
    var mounts = this.get('mounts')||[];
    return mounts.filter(function(mount) {
      return ['removed','purged', 'inactive'].indexOf(mount.get('state')) === -1;
    });
  }.property('mounts.[]','mounts.@each.state')
});

Volume.reopenClass({
  alwaysInclude: ['mounts'],
  stateMap: {
    'active':           {icon: 'icon icon-hdd',    color: 'text-success'},
  },
});

export default Volume;
