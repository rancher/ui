import Cattle from 'ui/utils/cattle';

var ApikeyController = Cattle.TransitioningResourceController.extend({
  actions: {
    deactivate: function() {
      return this.doAction('deactivate');
    },

    activate: function() {
      return this.doAction('activate');
    },

    restore: function() {
      return this.doAction('restore');
    },

    purge: function() {
      return this.doAction('purge');
    },

    edit: function() {
      this.transitionToRoute('apikey.edit',this.get('model'));
    },

    delete: function() {
      this.transitionToRoute('apikey.delete',this.get('model'));
    },
  },

  availableActions: function() {
    var a = this.get('actions');

    return [
      { tooltip: 'Edit',          icon: 'fa-edit',          action: 'edit',         enabled: !!a.update },
      { tooltip: 'Activate',      icon: 'fa-play',          action: 'activate',     enabled: !!a.activate },
      { tooltip: 'Deactivate',    icon: 'fa-pause',         action: 'deactivate',   enabled: !!a.deactivate },
      { tooltip: 'Restore',       icon: 'fa-ambulance',     action: 'restore',      enabled: !!a.restore },
      { tooltip: 'Delete',        icon: 'fa-trash-o',       action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { tooltip: 'Purge',         icon: 'fa-fire',          action: 'purge',        enabled: !!a.purge },
    ];
  }.property('actions.{update,activate,deactivate,restore,remove,purge}'),
});

ApikeyController.reopenClass({
  stateMap: {
    'active':     {icon: 'fa-circle-o',   color: 'text-success'},
    'inactive':   {icon: 'fa-circle',  color: 'text-muted'},
    'purged':     {icon: 'fa-fire',   color: 'text-danger'},
    'removed':    {icon: 'fa-trash-o',   color: 'text-danger'},
    'requested':  {icon: 'fa-ticket', color: 'text-info'},
  }
});

export default ApikeyController;
