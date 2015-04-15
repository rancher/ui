import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var LoadBalancerTargetController = Cattle.TransitioningResourceController.extend({
  isIp: Ember.computed.notEmpty('ipAddress'),


  delete: function() {
    return this.get('store').find('loadbalancer', this.get('loadBalancerId')).then((lb) => {
      return lb.waitForAndDoAction('removetarget',{
        instanceId: this.get('instanceId'),
        ipAddress: this.get('ipAddress')
      });
    });
  },

  actions: {
    promptDelete: function() {
      // @TODO Fix this hackery for nested components...
      // http://emberjs.jsbin.com/mecesakase
      if ( Ember.Component.detectInstance(this.get('target')) )
      {
        this.set('target', window.l('router:main'));
      }

      this._super();
    },

    delete: function() {
      this.delete();
    }
  },

  availableActions: function() {

    var a = this.get('actions');

    var choices = [
      { label: 'Remove Target', icon: 'ss-trash',     action: 'promptDelete',        enabled: true, altAction: 'delete' },
      { label: 'Purge',         icon: 'ss-tornado',          action: 'purge',        enabled: !!a.purge },
    ];

    return choices;
  }.property('actions.{remove,purge}'),
});

LoadBalancerTargetController.reopenClass({
  stateMap: {
    'requested':        {icon: 'ss-tag',            color: 'text-danger'},
    'activating':       {icon: 'ss-tag',            color: 'text-danger'},
    'active':           {icon: 'ss-target',         color: 'text-success'},
    'removing':         {icon: 'ss-trash',          color: 'text-danger'},
    'removed':          {icon: 'ss-trash',          color: 'text-danger'},
  }
});

export default LoadBalancerTargetController;
