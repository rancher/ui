import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var LoadBalancerListenerController = Cattle.TransitioningResourceController.extend({
  isIp: Ember.computed.notEmpty('ipAddress'),

  delete: function() {
    return this.get('store').find('loadbalancer', this.get('loadBalancerId')).then((lb) => {
      return lb.waitForAndDoAction('removetarget',{
        instanceId: this.get('instanceId'),
        ipAddress: this.get('ipAddress')
      });
    });
  },

  availableActions: function() {
    var a = this.get('actions');

    var choices = [
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete',        enabled: !!a.remove, altAction: 'delete' },
      { label: 'Purge',         icon: 'ss-tornado',          action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'View in API',   icon: 'fa fa-external-link', action: 'goToApi',      enabled: true,            detail: true },
    ];

    return choices;
  }.property('actions.{remove,purge}'),
});

LoadBalancerListenerController.reopenClass({
  stateMap: {
    'requested':        {icon: 'ss-tag',            color: 'text-danger'},
    'activating':       {icon: 'ss-tag',            color: 'text-danger'},
    'active':           {icon: 'ss-touchtonephone', color: 'text-success'},
    'removing':         {icon: 'ss-trash',          color: 'text-danger'},
    'removed':          {icon: 'ss-trash',          color: 'text-danger'},
  }
});

export default LoadBalancerListenerController;
