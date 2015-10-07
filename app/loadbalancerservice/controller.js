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

    var a = this.get('actionLinks');

    var choices = [
      { label: 'Start',         icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate,    color: 'text-success'},
      { label: 'Stop',          icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate,  color: 'text-danger'},
      { label: 'Delete',        icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'Purge',         icon: '',                       action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'View in API',   icon: 'icon icon-externallink', action: 'goToApi',      enabled: true},
      { divider: true },
      { label: 'Edit',          icon: 'icon icon-edit',       action: 'edit',         enabled: !!a.update },
    ];

    return choices;
  }.property('actionLinks.{activate,deactivate,update,remove,purge}'),

  getEnvironment: function() {
    return this.get('store').find('environment', this.get('environmentId'));
  },
});

LoadBalancerServiceController.reopenClass({
  stateMap: {
    'active':           {icon: 'icon icon-fork',           color: 'text-success'},
  }
});

export default LoadBalancerServiceController;
