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
