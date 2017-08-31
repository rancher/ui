import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { denormalizeId } from 'ember-api-store/utils/denormalize';

var Volume = Resource.extend({
  type: 'volume',

  intl: Ember.inject.service(),

  stack: denormalizeId('stackId'),
  isRoot: Ember.computed.notEmpty('instanceId'),

  scope: function() {
    return 'standalone';
  }.property(),

  displayNameScope: function() {
    return this.get('displayName') + ' (' + this.get('intl').t('volumesPage.scope.standalone')+ ')';
  }.property('displayName','intl.locale'),

  availableActions: function() {
    var l = this.get('links');

    return [
      { label: 'action.remove',           icon: 'icon icon-trash',          action: 'promptDelete',      enabled: !!l.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',  action: 'goToApi',           enabled: true },
    ];
  }.property('links.{remove}'),

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
