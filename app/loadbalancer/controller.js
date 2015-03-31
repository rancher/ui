import Cattle from 'ui/utils/cattle';

var LoadBalancerController = Cattle.TransitioningResourceController.extend({
  availableActions: function() {
    var a = this.get('actions');

    var out = [
//      { label: 'Add Container', icon: 'ss-plus',      action: 'newContainer', enabled: true,            color: 'text-primary' },
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'View in API',   icon: 'fa fa-external-link', action: 'goToApi',      enabled: true,            detail: true },
      { divider: true },
      { label: 'Edit',          icon: 'ss-write',            action: 'edit',         enabled: true },
    ];

    if ( this.get('machine.links.config') )
    {
      out.push({ label: 'Machine Config',   icon: 'ss-download', action: 'machineConfig',      enabled: true});
    }

    out.push({ label: 'View in API',   icon: '', action: 'goToApi',      enabled: true});
    out.push({ label: 'Purge',         icon: '',   action: 'purge',        enabled: !!a.purge, color: 'text-danger'});

    return out;
  }.property('actions.{activate,deactivate,remove,purge}'),
});

LoadBalancerController.reopenClass({
  stateMap: {
    'requested':        {icon: 'ss-tag',            color: 'text-danger'},
    'activating':       {icon: 'ss-tag',            color: 'text-danger'},
    'active':           {icon: 'ss-fork',           color: 'text-success'},
    'updating-active':  {icon: 'ss-fork',           color: 'text-success'},
    'removing':         {icon: 'ss-trash',          color: 'text-danger'},
    'removed':          {icon: 'ss-trash',          color: 'text-danger'},
    'purging':          {icon: 'ss-tornado',        color: 'text-danger'},
    'purged':           {icon: 'ss-tornado',        color: 'text-danger'},
    'restoring':        {icon: 'ss-medicalcross',   color: 'text-danger'},
  }
});

export default LoadBalancerController;
