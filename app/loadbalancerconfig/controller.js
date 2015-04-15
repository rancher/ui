import Cattle from 'ui/utils/cattle';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';

var LoadBalancerConfigController = Cattle.TransitioningResourceController.extend({
  actions: {
    edit: function() {
      this.transitionToRoute('loadbalancerconfig.edit', this.get('id'));
    }
  },

  availableActions: function() {
    var out = [
//      { label: 'Add Container', icon: 'ss-plus',      action: 'newContainer', enabled: true,            color: 'text-primary' },
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: this.get('canDelete'), altAction: 'delete', color: 'text-warning' },
      { label: 'View in API',   icon: 'fa fa-external-link', action: 'goToApi',      enabled: true,            detail: true },
      { divider: true },
      { label: 'Edit',          icon: 'ss-write',            action: 'edit',         enabled: true },
    ];

    return out;
  }.property('actions.{activate,deactivate,remove,purge}'),

  canDelete: function() {
    return !!this.get('actions.remove') && !this.get('unremovedBalancers.length');
  }.property('actions.remove','loadBalancers.[]'),

  unremovedBalancers: function() {
    return UnremovedArrayProxy.create({
      sourceContent: this.get('loadBalancers'),
    });
  }.property('loadBalancers'),
});

LoadBalancerConfigController.reopenClass({
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

export default LoadBalancerConfigController;
