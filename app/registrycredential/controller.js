import Cattle from 'ui/utils/cattle';

var RegistryController = Cattle.LegacyTransitioningResourceController.extend({
  actions: {
    deactivate: function() {
      return this.doAction('deactivate');
    },

    activate: function() {
      return this.doAction('activate');
    },

    edit: function() {
      this.transitionToRoute('registryCredential.edit',this.get('id'));
    },
  },

  displayName: function() {
    var email = this.get('email')+'';
    var pub = this.get('publicValue')+'';
    if ( email || pub )
    {
      return email + (pub ? ' - ' : '') + pub;
    }
    else
    {
      return '(' + this.get('id') + ')';
    }
  }.property('email','publicValue','id'),

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'Activate',      icon: 'icon icon-play',   action: 'activate',     enabled: !!a.activate },
      { label: 'Deactivate',    icon: 'icon icon-pause',  action: 'deactivate',   enabled: !!a.deactivate },
      { label: 'Delete',        icon: 'icon icon-trash',  action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'Restore',       icon: '',                 action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: '',                 action: 'purge',        enabled: !!a.purge },
    ];
  }.property('actionLinks.{update,activate,deactivate,restore,remove,purge}'),
});

export default RegistryController;
