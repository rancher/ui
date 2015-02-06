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

    promptDelete: function() {
      this.transitionToRoute('apikey.delete',this.get('model'));
    },

    delete: function() {
      return this.delete();
    }
  },

  availableActions: function() {
    var a = this.get('actions');

    return [
      { label: 'Edit',          icon: 'fa-edit',          action: 'edit',         enabled: !!a.update },
      { label: 'Activate',      icon: 'fa-play',          action: 'activate',     enabled: !!a.activate },
      { label: 'Deactivate',    icon: 'fa-pause',         action: 'deactivate',   enabled: !!a.deactivate },
      { label: 'Restore',       icon: 'fa-ambulance',     action: 'restore',      enabled: !!a.restore },
      { label: 'Delete',        icon: 'fa-trash-o',       action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { label: 'Purge',         icon: 'fa-fire',          action: 'purge',        enabled: !!a.purge },
    ];
  }.property('actions.{update,activate,deactivate,restore,remove,purge}'),
});

ApikeyController.reopenClass({
  stateMap: {
    'active':     {icon: 'fa-circle-o', color: 'text-success'},
    'inactive':   {icon: 'fa-circle',   color: 'text-muted'},
    'purged':     {icon: 'fa-fire',     color: 'text-danger'},
    'removed':    {icon: 'fa-trash-o',  color: 'text-danger'},
    'requested':  {icon: 'fa-ticket',   color: 'text-info'},
  }
});

export default ApikeyController;
