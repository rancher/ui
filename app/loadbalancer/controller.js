import Cattle from 'ui/utils/cattle';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';

var LoadBalancerController = Cattle.LegacyTransitioningResourceController.extend({
  actions: {
    newTarget: function() {
      this.transitionToRoute('loadbalancer.targets.new', this.get('id'));
    },

    edit: function() {
      this.transitionToRoute('loadbalancer.edit', this.get('id'));
    },
  },

  availableActions: function() {
    var a = this.get('actions');

    var out = [
//      { label: 'Add Container', icon: 'ss-plus',      action: 'newContainer', enabled: true,            color: 'text-primary' },
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'View in API',   icon: 'fa fa-external-link', action: 'goToApi',      enabled: true,            detail: true },
      { divider: true },
      { label: 'Edit',          icon: 'ss-write',            action: 'edit',         enabled: true },
    ];

    return out;
  }.property('actions.{activate,deactivate,remove,purge}'),

  arrangedTargets: function() {
    return UnremovedArrayProxy.create({
      sourceContent: this.get('loadBalancerTargets'),
      sortProperties: ['ipAddress', 'instance.name', 'instance.id', 'instanceId']
    });
  }.property('instances.[]','loadBalancerTargets.@each.{instanceId,ipAddress}'),
});

LoadBalancerController.reopenClass({
  stateMap: {
    'active':           {icon: 'ss-fork',           color: 'text-success'},
  }
});

export default LoadBalancerController;
