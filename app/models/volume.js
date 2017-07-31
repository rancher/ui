import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { denormalizeId, denormalizeIdArray } from 'ember-api-store/utils/denormalize';

var Volume = Resource.extend({
  type: 'volume',

  intl: Ember.inject.service(),

  mounts: denormalizeIdArray('mountIds'),
  stack: denormalizeId('stackId'),

  isRoot: Ember.computed.notEmpty('instanceId'),

  scope: function() {
    return 'standalone';
  }.property(),

  displayNameScope: function() {
    return this.get('displayName') + ' (' + this.get('intl').t('volumesPage.scope.standalone')+ ')';
  }.property('displayName','intl.locale'),

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'action.remove',           icon: 'icon icon-trash',          action: 'promptDelete',      enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',  action: 'goToApi',           enabled: true },
    ];
  }.property('actionLinks.{remove}'),

  displayUri: function() {
    return (this.get('uri')||'').replace(/^file:\/\//,'');
  }.property('uri'),
});

Volume.reopenClass({
  stateMap: {
    'active':           {icon: 'icon icon-hdd',    color: 'text-success'},
  },
});

export default Volume;
