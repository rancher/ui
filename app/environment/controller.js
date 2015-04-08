import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var EnvironmentController = Cattle.TransitioningResourceController.extend({
  availableActions: function() {
    var a = this.get('actions');

    var out = [
      { label: 'Activate Services', icon: 'ss-arrow-up',      action: 'activateServices',   enabled: !!a.activateservices },
      { label: 'Deactivate Services', icon: 'ss-arrow-down',  action: 'deactivateServices', enabled: !!a.deactivateservices },
      { label: 'Export Config', icon: 'ss-download',          action: 'exportConfig',       enabled: !!a.exportconfig },
      { divider: true },
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'View in API',   icon: 'fa fa-external-link', action: 'goToApi',      enabled: true },
      { divider: true },
      { label: 'Edit',          icon: 'ss-write',            action: 'edit',         enabled: true },
    ];

    return out;
  }.property('actions.{remove,purge,activateservices,deactivateservices,exportconfig}'),
});

EnvironmentController.reopenClass({
  stateMap: {
    'requested':        {icon: 'ss-tag',            color: 'text-danger'},
    'activating':       {icon: 'ss-tag',            color: 'text-danger'},
    'active':           {icon: 'ss-globe',          color: 'text-success'},
    'removing':         {icon: 'ss-trash',          color: 'text-danger'},
    'removed':          {icon: 'ss-trash',          color: 'text-danger'},
  }
});

export default EnvironmentController;
