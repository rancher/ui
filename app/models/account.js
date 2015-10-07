import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';
import C from 'ui/utils/constants';

var Account = Resource.extend(PolledResource, {
  type: 'account',

  actions: {
    deactivate() {
      return this.doAction('deactivate');
    },

    activate() {
      return this.doAction('activate');
    },

    edit: function() {
      this.get('application').setProperties({
        editAccount: true,
        originalModel: this,
      });
    },
  },

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'Activate',      icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate },
      { label: 'Deactivate',    icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate },
      { label: 'Delete',        icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'Purge',         icon: '',                       action: 'purge',        enabled: !!a.purge },
      { label: 'Restore',       icon: '',                       action: 'restore',      enabled: !!a.restore },
      { divider: true },
      { label: 'Edit',          icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update },
      { label: 'View in API',   icon: 'icon icon-externallink', action: 'goToApi',      enabled: true },
    ];
  }.property('actionLinks.{update,activate,deactivate,restore,remove,purge}'),

  username: function() {
    var cred = this.get('passwordCredential');
    if ( cred && cred.get('state') === 'active' )
    {
      return cred.get('publicValue');
    }
    else
    {
      return null;
    }
  }.property('passwordCredential.{state,publicValue}'),

  passwordCredential: function() {
    return (this.get('credentials')||[]).filterBy('kind','password')[0];
  }.property('credentials.@each.kind'),

  apiKeys: function() {
    return (this.get('credentials')||[]).filterBy('kind','apiKey');
  }.property('credentials.@each.kind')
});

Account.reopenClass({
  alwaysInclude: ['credentials'],
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,

  headers: {
    [C.HEADER.PROJECT]: undefined, // Requests for projects use the user's scope, not the project
  },
});

export default Account;
