import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

var ApiKey = Resource.extend(PolledResource,{
  type: 'apiKey',
  publicValue: null,
  secretValue: null,

  actions: {
    deactivate: function() {
      return this.doAction('deactivate');
    },

    activate: function() {
      return this.doAction('activate');
    },

    edit: function() {
      this.get('application').setProperties({
        editApikey: true,
        editApikeyIsNew: false,
        originalModel: this
      });
    },
  },

  displayName: function() {
    return this.get('name') || this.get('publicValue') || '('+this.get('id')+')';
  }.property('name','publicValue','id'),

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'Activate',      icon: 'icon icon-play',   action: 'activate',     enabled: !!a.activate },
      { label: 'Deactivate',    icon: 'icon icon-pause',  action: 'deactivate',   enabled: !!a.deactivate },
      { label: 'Delete',        icon: 'icon icon-trash',  action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'Purge',         icon: '',                 action: 'purge',        enabled: !!a.purge },
      { label: 'Restore',       icon: '',                 action: 'restore',      enabled: !!a.restore },
      { divider: true },
      { label: 'Edit',          icon: 'icon icon-edit',   action: 'edit',         enabled: !!a.update },
    ];
  }.property('actionLinks.{update,activate,deactivate,restore,remove,purge}'),
});

ApiKey.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default ApiKey;
