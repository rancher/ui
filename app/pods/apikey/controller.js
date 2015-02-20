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
      { label: 'Edit',          icon: 'ss-write',         action: 'edit',         enabled: !!a.update },
      { label: 'Activate',      icon: 'ss-play',          action: 'activate',     enabled: !!a.activate },
      { label: 'Deactivate',    icon: 'ss-pause',         action: 'deactivate',   enabled: !!a.deactivate },
      { label: 'Restore',       icon: 'ss-medicalcross',  action: 'restore',      enabled: !!a.restore },
      { label: 'Delete',        icon: 'ss-trash',         action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { label: 'Purge',         icon: 'ss-tornado',       action: 'purge',        enabled: !!a.purge },
    ];
  }.property('actions.{update,activate,deactivate,restore,remove,purge}'),
});

ApikeyController.reopenClass({
  stateMap: {
    'active':     {icon: 'ss-record',     color: 'text-success'},
    'inactive':   {icon: 'fa fa-circle',  color: 'text-muted'},
    'purged':     {icon: 'ss-tornado',    color: 'text-danger'},
    'removed':    {icon: 'ss-trash',      color: 'text-danger'},
    'requested':  {icon: 'ss-tag',        color: 'text-info'},
  }
});

export default ApikeyController;
