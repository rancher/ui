import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

var Account = Resource.extend(PolledResource, {
  type: 'account',
  modalService: service('modal'),

  reservedKeys: ['_allPasswords'],

  actions: {
    deactivate() {
      return this.doAction('deactivate');
    },

    activate() {
      return this.doAction('activate');
    },

    edit: function() {
      this.get('modalService').toggleModal('modal-edit-account', this);
    },
  },

  availableActions: function() {
    let a = this.get('actionLinks');
    let l = this.get('links');

    return [
      { label: 'action.edit',       icon: 'icon icon-edit',         action: 'edit',         enabled: !!l.update },
      { divider: true },
      { label: 'action.activate',   icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate , bulkable: true},
      { label: 'action.deactivate', icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate , bulkable: true},
      { divider: true },
      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }.property('actionLinks.{activate,deactivate,restore}','links.{update,remove}'),

  username: function() {
    return this.get('passwordCredential.publicValue');
  }.property('passwordCredential.publicValue'),

  passwordCredential: function() {
    return (this.get('passwords')||[]).objectAt(0);
  }.property('passwords.@each.kind'),

  _allPasswords: null,
  passwords: function() {
    let all = this.get('_allPasswords');
    if ( !all ) {
      all = this.get('store').all('password');
      this.set('_allPasswords', all);
    }

    return all.filterBy('accountId', this.get('id'));
  }.property('_allPasswords.@each.accountId','id'),
});

Account.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Account;
