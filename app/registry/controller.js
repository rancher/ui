import Cattle from 'ui/utils/cattle';

var RegistryController = Cattle.TransitioningResourceController.extend({
  actions: {
    deactivate: function() {
      return this.doAction('deactivate');
    },

    activate: function() {
      return this.doAction('activate');
    },

    edit: function() {
      this.transitionToRoute('registry.edit',this.get('id'));
    },
  },

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

  availableActions: function() {
    var a = this.get('actions');

    return [
      { label: 'Activate',      icon: 'ss-play',  action: 'activate',     enabled: !!a.activate },
      { label: 'Deactivate',    icon: 'ss-pause', action: 'deactivate',   enabled: !!a.deactivate },
      { label: 'Delete',        icon: 'ss-trash', action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'Purge',         icon: 'ss-tornado',           action: 'purge',   enabled: !!a.purge },
      { label: 'Restore',       icon: 'ss-medicalcross',      action: 'restore', enabled: !!a.restore },
      { label: 'View in API',   icon: 'fa fa-external-link',  action: 'goToApi', enabled: true },
      { divider: true },
      { label: 'Edit',          icon: 'ss-write', action: 'edit',         enabled: !!a.update },
    ];
  }.property('actions.{update,activate,deactivate,restore,remove,purge}'),

  credential: function() {
    return this.get('credentials.firstObject');
  }.property(),
});

RegistryController.reopenClass({
  stateMap: {
    'active':     {icon: 'ss-record',     color: 'text-success'},
    'inactive':   {icon: 'fa fa-circle',  color: 'text-muted'},
    'purged':     {icon: 'ss-tornado',    color: 'text-danger'},
    'removed':    {icon: 'ss-trash',      color: 'text-danger'},
    'requested':  {icon: 'ss-tag',        color: 'text-info'},
  }
});

export default RegistryController;
