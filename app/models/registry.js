import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var Registry = Resource.extend({
  type: 'registry',
  serverAddress: null,

  actions: {
    deactivate: function() {
      return this.doAction('deactivate');
    },

    activate: function() {
      return this.doAction('activate');
    },

    edit: function() {
      this.get('store').find('registry').then((registries) => {
        this.get('application').setProperties({
          editRegistry: true,
          originalModel: Ember.Object.create({
            registries: registries,
            registry: this,
            credential: this.get('credential'),
          })
        });
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
      { label: 'Restore',       icon: 'icon icon-medicalcross', action: 'restore',      enabled: !!a.restore },
      { label: 'View in API',   icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
      { divider: true },
      { label: 'Edit',          icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update },
    ];
  }.property('actionLinks.{update,activate,deactivate,restore,remove,purge}'),

  displayName: Ember.computed.alias('displayAddress'),
  displayAddress: function() {
    var address = this.get('serverAddress').toLowerCase();
    if ( address === 'index.docker.io' )
    {
      return 'DockerHub';
    }
    else if ( address === 'quay.io' )
    {
      return 'Quay';
    }
    else
    {
      return address;
    }
  }.property('serverAddress'),

  credential: function() {
    var credentials = this.get('credentials');
    if ( credentials )
    {
      return credentials.objectAt(credentials.get('length')-1);
    }

  }.property('credentials.@each.{publicValue,email}'),
});

Registry.reopenClass({
  alwaysInclude: ['credentials'],
});

export default Registry;
