import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';
import C from 'ui/utils/constants';

var ApiKey = Resource.extend(PolledResource,{

  type: 'apiKey',
  publicValue: null,
  secretValue: null,
  modalService: Ember.inject.service('modal'),

  actions: {
    deactivate: function() {
      return this.doAction('deactivate');
    },

    activate: function() {
      return this.doAction('activate');
    },

    edit: function() {
      this.get('modalService').toggleModal('modal-edit-apikey', this);
    },
  },

  isForAccount: function() {
    return this.get('accountId') === this.get(`session.${C.SESSION.ACCOUNT_ID}`);
  }.property('accountId', `session.${C.SESSION.ACCOUNT_ID}`),

  displayName: function() {
    return this.get('name') || this.get('publicValue') || '('+this.get('id')+')';
  }.property('name','publicValue','id'),

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'action.edit',          icon: 'icon icon-edit',   action: 'edit',         enabled: !!a.update },
      { divider: true },
      { label: 'action.activate',      icon: 'icon icon-play',   action: 'activate',     enabled: !!a.activate },
      { label: 'action.deactivate',    icon: 'icon icon-pause',  action: 'deactivate',   enabled: !!a.deactivate },
      { divider: true },
      { label: 'action.remove',        icon: 'icon icon-trash',  action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
    ];
  }.property('actionLinks.{update,activate,deactivate,restore,remove,purge}'),
});

ApiKey.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default ApiKey;
