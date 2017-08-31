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
    let a = this.get('actionLinks');
    let l = this.get('links');

    return [
      { label: 'Activate',      icon: 'icon icon-play',   action: 'activate',     enabled: !!a.activate },
      { label: 'Deactivate',    icon: 'icon icon-pause',  action: 'deactivate',   enabled: !!a.deactivate },
      { divider: true },
      { label: 'Delete',        icon: 'icon icon-trash',  action: 'promptDelete', enabled: !!l.remove, altAction: 'delete' },
    ];
  }.property('actionLinks.{activate,deactivate}','links.{remove}'),
});

export default RegistryController;
