import Cattle from 'ui/utils/cattle';

var MachineController = Cattle.TransitioningResourceController.extend({
  actions: {
    delete: function() {
      return this.delete();
    },
  },

  availableActions: function() {
    var a = this.get('actions')||{};

    return [
      { label: 'View in API',   icon: 'fa-external-link', action: 'goToApi',      enabled: true},
      { label: 'Delete',        icon: 'fa-trash-o',       action: 'delete',       enabled: !!a.remove},
    ];
  }.property('actions.remove'),
});

MachineController.reopenClass({
  stateMap: {
    'requested':      {icon: 'fa-ticket',       color: 'text-success'},
    'creating':       {icon: 'fa-ticket',       color: 'text-success'},
    'created':        {icon: 'fa-ticket',       color: 'text-success'},
    'bootstrapping':  {icon: 'fa-ticket',       color: 'text-success'},
    'active':         {icon: 'fa-ticket',       color: 'text-success'},
    'removing':       {icon: 'fa-trash',        color: 'text-danger'},
    'removed':        {icon: 'fa-trash',        color: 'text-danger'},
    'updating':       {icon: 'fa-ticket',       color: 'text-success'},
  }
});

export default MachineController;
