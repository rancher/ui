import Cattle from 'ui/utils/cattle';

var ServiceController = Cattle.TransitioningResourceController.extend({
  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },
  },

  availableActions: function() {

    var a = this.get('actions');

    var choices = [
      { label: 'Activate',      icon: 'ss-play',      action: 'activate',     enabled: !!a.activate,    color: 'text-success'},
      { label: 'Deactivate',    icon: 'ss-pause',     action: 'deactivate',   enabled: !!a.deactivate,  color: 'text-danger'},
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'Purge',         icon: 'ss-tornado',   action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'View in API',   icon: '',             action: 'goToApi',      enabled: true},
      //{ divider: true },
      //{ label: 'Edit',          icon: 'ss-write',     action: 'edit',         enabled: !!a.update },
    ];

    return choices;
  }.property('actions.{activate,deactivate,update,remove,purge}'),

  getEnvironment: function() {
    return this.get('store').find('environment', this.get('environmentId'));
  },
});

ServiceController.reopenClass({
  stateMap: {
    'requested':        {icon: 'ss-tag',            color: 'text-danger'},
    'registering':      {icon: 'ss-tag',            color: 'text-danger'},
    'activating':       {icon: 'ss-tag',            color: 'text-danger'},
    'active':           {icon: 'ss-layergroup',     color: 'text-success'},
    'deactivating':     {icon: 'ss-down',           color: 'text-danger'},
    'inactive':         {icon: 'fa fa-circle',      color: 'text-danger'},
    'removing':         {icon: 'ss-trash',          color: 'text-danger'},
    'removed':          {icon: 'ss-trash',          color: 'text-danger'},
  }
});

export default ServiceController;
