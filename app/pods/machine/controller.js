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
      { label: 'View in API',   icon: 'fa fa-external-link',  action: 'goToApi',      enabled: true},
      { label: 'Delete',        icon: 'ss-trash',             action: 'delete',       enabled: !!a.remove},
    ];
  }.property('actions.remove'),
});

MachineController.reopenClass({
  stateMap: {
    'requested':      {icon: 'ss-tag',       color: 'text-success'},
    'creating':       {icon: 'ss-tag',       color: 'text-success'},
    'created':        {icon: 'ss-tag',       color: 'text-success'},
    'bootstrapping':  {icon: 'ss-tag',       color: 'text-success'},
    'active':         {icon: 'ss-tag',       color: 'text-success'},
    'removing':       {icon: 'ss-trash',     color: 'text-danger'},
    'removed':        {icon: 'ss-trash',     color: 'text-danger'},
    'updating':       {icon: 'ss-tag',       color: 'text-success'},
  }
});

export default MachineController;
