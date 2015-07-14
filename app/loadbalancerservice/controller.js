import Cattle from 'ui/utils/cattle';

var LoadBalancerServiceController = Cattle.LegacyTransitioningResourceController.extend({
  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    edit: function() {
      this.transitionToRoute('service.edit', this.get('id'));
    },

    scaleUp: function() {
      this.incrementProperty('scale');
      return this.save();
    }
  },

  availableActions: function() {

    var a = this.get('actions');

    var choices = [
      { label: 'Start',         icon: 'ss-play',      action: 'activate',     enabled: !!a.activate,    color: 'text-success'},
      { label: 'Stop',          icon: 'ss-pause',     action: 'deactivate',   enabled: !!a.deactivate,  color: 'text-danger'},
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'Purge',         icon: 'ss-tornado',   action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'View in API',   icon: '',             action: 'goToApi',      enabled: true},
      { divider: true },
      { label: 'Edit',          icon: 'ss-write',     action: 'edit',         enabled: !!a.update },
    ];

    return choices;
  }.property('actions.{activate,deactivate,update,remove,purge}'),

  getEnvironment: function() {
    return this.get('store').find('environment', this.get('environmentId'));
  },
});

LoadBalancerServiceController.reopenClass({
  stateMap: {
    'active':           {icon: 'ss-fork',           color: 'text-success'},
  }
});

export default LoadBalancerServiceController;
