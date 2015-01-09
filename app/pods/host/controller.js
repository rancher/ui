import Cattle from 'ui/utils/cattle';

var HostController = Cattle.TransitioningResourceController.extend({
  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    delete: function() {
      return this.delete();
    },

    purge: function() {
      return this.doAction('purge');
    },

    promptDelete: function() {
      this.transitionToRoute('host.delete', this.get('model'));
    },
  },

  availableActions: function() {
    var a = this.get('actions');

    return [
      { tooltip: 'View in API',   icon: 'fa-external-link', action: 'goToApi',      enabled: true,            detail: true },
      { tooltip: 'Activate',      icon: 'fa-arrow-up',      action: 'activate',     enabled: !!a.activate },
      { tooltip: 'Deactivate',    icon: 'fa-arrow-down',    action: 'deactivate',   enabled: !!a.deactivate },
      { tooltip: 'Delete',        icon: 'fa-trash-o',       action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { tooltip: 'Purge',         icon: 'fa-fire',          action: 'purge',        enabled: !!a.purge },
    ];
  }.property('actions.{activate,deactivate,remove,purge}'),

  displayIp: function() {
    var obj = (this.get('ipAddresses')||[]).get('firstObject');
    if ( obj )
    {
      return obj.get('address');
    }

    return null;
  }.property('ipAddresses','ipAddresses.[]')
});

HostController.reopenClass({
  stateMap: {
    'requested':        {icon: 'fa-ticket',      color: 'text-danger'},
    'registering':      {icon: 'fa-ticket',      color: 'text-danger'},
    'activating':       {icon: 'fa-ticket',      color: 'text-danger'},
    'active':           {icon: 'fa-circle-o',    color: 'text-info'},
    'reconnecting':     {icon: 'fa-cog fa-spin', color: 'text-danger'},
    'updating-active':  {icon: 'fa-circle-o',    color: 'text-info'},
    'updating-inactive':{icon: 'fa-warning',     color: 'text-danger'},
    'deactivating':     {icon: 'fa-adjust',      color: 'text-danger'},
    'inactive':         {icon: 'fa-circle',      color: 'text-danger'},
    'removing':         {icon: 'fa-trash',       color: 'text-danger'},
    'removed':          {icon: 'fa-trash',       color: 'text-danger'},
    'purging':          {icon: 'fa-fire',        color: 'text-danger'},
    'purged':           {icon: 'fa-fire',        color: 'text-danger'},
    'restoring':        {icon: 'fa-trash',       color: 'text-danger'},
  }
});

export default HostController;
