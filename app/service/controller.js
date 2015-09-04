import Ember from 'ember';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';

var ServiceController = Ember.Controller.extend(CattleTransitioningController, {
  needs: ['environment','application'],
  environment: Ember.computed.alias('controllers.environment.model'),

  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    cancelUpgrade: function() {
      return this.doAction('cancelupgrade');
    },

    edit: function() {
      var type = this.get('model.type').toLowerCase();
      if ( type === 'loadbalancerservice' )
      {
        this.get('model').importLink('loadBalancerListeners').then(() => {
          this.get('controllers.application').setProperties({
            editLoadBalancerService: true,
            originalModel: this.get('model'),
          });
        });
      }
      else if ( type === 'dnsservice' )
      {
        this.get('controllers.application').setProperties({
          editAliasService: true,
          originalModel: this.get('model'),
        });
      }
      else
      {
        this.get('controllers.application').setProperties({
          editService: true,
          originalModel: this.get('model'),
        });
      }
    },

    scaleUp: function() {
      this.get('model').incrementProperty('scale');
      this.saveScale();
    },

    scaleDown: function() {
      if ( this.get('model.scale') >= 1 )
      {
        this.get('model').decrementProperty('scale');
        this.saveScale();
      }
    },

    clone: function() {
      var route;
      switch ( this.get('model.type').toLowerCase() )
      {
        case 'service':             route = 'service.new';          break;
        case 'dnsservice':          route = 'service.new-alias';    break;
        case 'loadbalancerservice': route = 'service.new-balancer'; break;
        case 'externalservice':     route = 'service.new-external'; break;
        default: return void this.send('error','Unknown service type: ' + this.get('type'));
      }

      this.get('controllers.application').transitionToRoute(route, {queryParams: {
        serviceId: this.get('model.id'),
        environmentId: this.get('model.environmentId'),
      }});
    },
  },

  scaleTimer: null,
  saveScale: function() {
    if ( this.get('scaleTimer') )
    {
      Ember.run.cancel(this.get('scaleTimer'));
    }

    var timer = Ember.run.later(this, function() {
      this.save();
    }, 500);

    this.set('scaleTimer', timer);
  },

  availableActions: function() {
    var a = this.get('model.actions');

    var choices = [
      { label: 'Start',         icon: 'ss-play',      action: 'activate',     enabled: !!a.activate,    color: 'text-success'},
      { label: 'Stop',          icon: 'ss-pause',     action: 'deactivate',   enabled: !!a.deactivate,  color: 'text-danger'},
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'Cancel Upgrade',icon: 'ss-down',      action: 'cancelUpgrade',enabled: !!a.cancelupgrade },
      { label: 'Purge',         icon: 'ss-tornado',   action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'View in API',   icon: '',             action: 'goToApi',      enabled: true },
      { label: 'Clone',         icon: 'ss-copier',    action: 'clone',        enabled: true },
      { label: 'Edit',          icon: 'ss-write',     action: 'edit',         enabled: !!a.update },
    ];

    return choices;
  }.property('model.actions.{activate,deactivate,update,remove,purge,cancelupgrade}'),

  state: Ember.computed.alias('model.combinedState'),
});

export default ServiceController;
