import Resource from 'ember-api-store/models/resource';
import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { denormalizeId, denormalizeIdArray } from 'ember-api-store/utils/denormalize';
import StateCounts from 'ui/mixins/state-counts';
import EndpointPorts from 'ui/mixins/endpoint-ports';

var Service = Resource.extend(StateCounts, EndpointPorts, {
  type: 'service',
  intl: Ember.inject.service(),
  growl: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),

  instances: denormalizeIdArray('instanceIds'),
  instanceCount: Ember.computed.alias('instances.length'),
  stack: denormalizeId('stackId'),

  init() {
    this._super(...arguments);
    this.defineStateCounts('instances', 'instanceStates', 'instanceCountSort');
  },

  lcType: Ember.computed('type', function() {
    return (this.get('type')||'').toLowerCase();
  }),

  actions: {
    editDns() {
      this.get('modalService').toggleModal('modal-edit-dns', this);
    },

    activate() {
      return this.doAction('activate');
    },

    deactivate() {
      return this.doAction('deactivate');
    },

    pause() {
      return this.doAction('pause');
    },

    restart() {
      return this.doAction('restart', {rollingRestartStrategy: {}});
    },

    rollback() {
      this.get('modalService').toggleModal('modal-rollback-service', {
        originalModel: this
      });
    },

    garbageCollect() {
      return this.doAction('garbagecollect');
    },

    promptStop() {
      this.get('modalService').toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action: 'deactivate'
      });
    },

    scaleUp() {
      let scale = this.get('scale');
      let max = this.get('scaleMax');
      scale += this.get('scaleIncrement')||1;
      if ( max ) {
        scale = Math.min(scale, max);
      }
      this.set('scale', scale);
      this.saveScale();
    },

    scaleDown() {
      let scale = this.get('scale');
      let min = this.get('scaleMin') || 0;
      scale -= this.get('scaleIncrement')||1;
      scale = Math.max(scale, min);
      this.set('scale', scale);
      this.saveScale();
    },

    upgrade(upgradeImage='false') {
      var route = 'containers.run';
      if ( this.get('lcType') === 'loadbalancerservice' ) {
        route = 'balancers.run';
      }

      this.get('application').transitionToRoute(route, {queryParams: {
        serviceId: this.get('id'),
        upgrade: true,
        upgradeImage: upgradeImage,
        stackId: this.get('stackId'),
      }});
    },

    clone() {
      var route;
      switch ( this.get('lcType') )
      {
        case 'service':             route = 'containers.run'; break;
        case 'scalinggroup':        route = 'containers.run'; break;
        case 'dnsservice':          route = 'dns.new';        break;
        case 'loadbalancerservice': route = 'balancers.run';  break;
        case 'externalservice':     route = 'dns.new';        break;
        default: return void this.send('error','Unknown service type: ' + this.get('type'));
      }

      this.get('application').transitionToRoute(route, {queryParams: {
        serviceId: this.get('id'),
        stackId: this.get('stackId'),
      }});
    },

    addSidekick() {
      this.get('application').transitionToRoute('containers.run', {queryParams: {
        serviceId: this.get('id'),
        addSidekick: true,
      }});
    },

    shell() {
      this.get('modalService').toggleModal('modal-shell', {
        model: this.get('containerForShell'),
        escToClose: false,
      });
    },

    popoutShell() {
      let proj = this.get('projects.current.id');
      let id = this.get('containerForShell.id');
      Ember.run.later(() => {
        window.open(`//${window.location.host}/env/${proj}/infra/console?instanceId=${id}&isPopup=true`, '_blank', "toolbars=0,width=900,height=700,left=200,top=200");
      });
    },
  },

  scaleTimer: null,
  saveScale() {
    if ( this.get('scaleTimer') )
    {
      Ember.run.cancel(this.get('scaleTimer'));
    }

    var timer = Ember.run.later(this, function() {
      this.save().catch((err) => {
        this.get('growl').fromError('Error updating scale',err);
      });
    }, 500);

    this.set('scaleTimer', timer);
  },

  availableActions: function() {
    var a = this.get('actionLinks');

    var isReal = this.get('isReal');
    var isK8s = this.get('isK8s');
    var canHaveContainers = this.get('canHaveContainers');
    var containerForShell = this.get('containerForShell');
    var isDriver = ['networkdriverservice','storagedriverservice'].includes(this.get('lcType'));
    var canCleanup = !!a.garbagecollect && this.get('canCleanup');

    var choices = [
      { label: 'action.upgradeOrEdit',  icon: 'icon icon-arrow-circle-up',  action: 'upgrade',        enabled: isReal },
      { label: 'action.edit',           icon: 'icon icon-pencil',           action: 'editDns',        enabled: !isReal },
      { label: 'action.rollback',       icon: 'icon icon-history',          action: 'rollback',       enabled: !!a.rollback && isReal && !!this.get('previousRevisionId') },
      { label: 'action.garbageCollect', icon: 'icon icon-garbage',          action: 'garbageCollect', enabled: canCleanup},
      { label: 'action.clone',          icon: 'icon icon-copy',             action: 'clone',          enabled: !isK8s && !isDriver },
//      { label: 'action.addSidekick',    icon: 'icon icon-plus-circle',      action: 'addSidekick',    enabled: this.get('canHaveSidekicks') },
      { divider: true },
      { label: 'action.execute',        icon: 'icon icon-terminal',         action: 'shell',          enabled: !!containerForShell, altAction:'popoutShell'},
//      { label: 'action.logs',           icon: 'icon icon-file',             action: 'logs',           enabled: !!a.logs, altAction: 'popoutLogs' },
      { divider: true },
      { label: 'action.pause',          icon: 'icon icon-pause',            action: 'pause',          enabled: !!a.pause, bulkable: true},
      { label: 'action.start',          icon: 'icon icon-play',             action: 'activate',       enabled: !!a.activate, bulkable: true},
      { label: 'action.restart',        icon: 'icon icon-refresh',          action: 'restart',        enabled: !!a.restart && canHaveContainers, bulkable: true },
      { label: 'action.stop',           icon: 'icon icon-stop',             action: 'promptStop',     enabled: !!a.deactivate, altAction: 'deactivate', bulkable: true},
      { divider: true },
      { label: 'action.remove',         icon: 'icon icon-trash',            action: 'promptDelete',   enabled: !!a.remove, altAction: 'delete', bulkable: true},
      { divider: true },
      { label: 'action.viewInApi',      icon: 'icon icon-external-link',    action: 'goToApi',        enabled: true },
    ];

    return choices;
  }.property('actionLinks.{activate,deactivate,pause,restart,update,remove,rollback,garbagecollect}','previousRevisionId',
    'lcType','isK8s','canHaveContainers','canHaveSidekicks','containerForShell'
  ),

  serviceLinks: null, // Used for clone
  reservedKeys: ['serviceLinks'],

  image: Ember.computed.alias('launchConfig.image'),

  displayStack: function() {
    var stack = this.get('stack');
    if ( stack ) {
      return stack.get('displayName');
    } else {
      return '...';
    }
  }.property('stack.displayName'),

  consumedServicesWithNames: function() {
    let store = this.get('store');
    let links = this.get('linkedServices')||{};
    let out = Object.keys(links).map((key) => {
      let name = key;
      let pos = name.indexOf('/');
      if ( pos >= 0 ) {
        name = name.substr(pos+1);
      }

      return Ember.Object.create({
        name: name,
        service: store.getById('service', links[key])
      });
    });

    return out.sortBy('name');
  }.property('linkedServices'),

  combinedState: function() {
    var service = this.get('state');
    var health = this.get('healthState');

    if ( ['active','updating-active'].indexOf(service) === -1 )
    {
      // If the service isn't active, return its state
      return service;
    }

    let hasCheck = !!this.get('launchConfig.healthCheck');

    if ( hasCheck && health ) {
      return health;
    } else {
      return service;
    }
  }.property('state', 'healthState', 'launchConfig.healthCheck'),

  isGlobalScale: function() {
    return (this.get('launchConfig.labels')||{})[C.LABEL.SCHED_GLOBAL] + '' === 'true';
  }.property('launchConfig.labels'),

  canScaleUp: function() {
    if ( !this.get('canScale') ) {
      return false;
    }

    let scale = this.get('scale');
    let max = this.get('scaleMax');
    if ( !max ) {
      return true;
    }

    scale += this.get('scaleIncrement')||1;
    return scale <= max;
  }.property('canScale','scaleMax','scaleIncrement','scale'),

  canScaleDown: function() {
    if ( !this.get('canScale') ) {
      return false;
    }

    let scale = this.get('scale');
    let min = this.get('scaleMin')||1;

    scale -= this.get('scaleIncrement')||1;
    return scale >= min;
  }.property('canScale','scaleMin','scaleIncrement','scale'),

  displayScale: function() {
    if ( this.get('isGlobalScale') ) {
      return this.get('intl').t('servicePage.globalScale', {scale: this.get('scale')});
    } else {
      return this.get('scale');
    }
  }.property('scale','isGlobalScale'),

  canHaveContainers: function() {
    if ( this.get('isReal') || this.get('isSelector') ) {
      return true;
    }

    return [
      'kubernetesservice',
      'composeservice',
    ].includes(this.get('lcType'));
  }.property('isReal','isSelector','lcType'),

  isReal: function() {
    let type = this.get('lcType');
    if ( this.get('isSelector') ) {
      return false;
    }

    return [
      'service',
      'scalinggroup',
      'networkdriverservice',
      'storagedriverservice',
      'loadbalancerservice',
    ].includes(type);
  }.property('lcType','isSelector'),

  canHaveSidekicks: function() {
    return ['service','scalinggroup'].includes(this.get('lcType'));
  }.property('lcType'),

  hasPorts: Ember.computed.alias('isReal'),
  hasImage: Ember.computed.alias('isReal'),
  hasLabels: Ember.computed.alias('isReal'),
  canUpgrade: Ember.computed.alias('isReal'),
  canScale: Ember.computed.alias('isReal'),

  isSelector: function() {
    return !!this.get('selectorContainer');
  }.property('selectorContainer'),

  isBalancer: function() {
    return ['loadbalancerservice'].indexOf(this.get('lcType')) >= 0;
  }.property('lcType'),

  canBalanceTo: function() {
    if ( this.get('lcType') === 'externalservice' && this.get('hostname') !== null) {
      return false;
    }

    return true;
  }.property('lcType','hostname'),

  isK8s: function() {
    return ['kubernetesservice'].indexOf(this.get('lcType')) >= 0;
  }.property('lcType'),

  displayType: function() {
    let known = [
      'loadbalancerservice',
      'dnsservice',
      'externalservice',
      'kubernetesservice',
      'composeservice',
      'networkdriverservice',
      'selectorservice',
      'storagedriverservice',
      'service'
    ];

    let type = this.get('lcType');
    if ( this.get('isSelector') ) {
      type = 'selectorservice';
    }

    if ( !known.includes(type) ) {
      type = 'service';
    }

    if ( type === 'externalservice' ) {
      if ( this.get('hostname') ) {
        type += '-host';
      } else {
        type += '-ip';
      }
    }

    return this.get('intl').t('servicePage.type.'+ type);
  }.property('lcType','isSelector','intl.locale'),

  hasSidekicks: function() {
    return this.get('secondaryLaunchConfigs.length') > 0;
  }.property('secondaryLaunchConfigs.length'),

  activeIcon: function() {
    return activeIcon(this);
  }.property('lcType'),

  memoryReservationBlurb: Ember.computed('launchConfig.memoryReservation', function() {
    if ( this.get('launchConfig.memoryReservation') ) {
      return Util.formatSi(this.get('launchConfig.memoryReservation'), 1024, 'iB', 'B');
    }
  }),

  containerForShell: function() {
    return this.get('instances').findBy('combinedState','running');
  }.property('instances.@each.combinedState'),

  canCleanup: function() {
    return !!this.get('instances').findBy('desired',false);
  }.property('instances.@each.desired'),
});

export function activeIcon(service)
{
  var out = 'icon icon-services';
  switch ( service.get('lcType') )
  {
    case 'loadbalancerservice': out = 'icon icon-fork';    break;
    case 'dnsservice':          out = 'icon icon-compass'; break;
    case 'externalservice':     out = 'icon icon-cloud';   break;
    case 'kubernetesservice':   out = 'icon icon-kubernetes'; break;
    case 'composeservice':      out = 'icon icon-docker'; break;
  }

  return out;
}

Service.reopenClass({
  stateMap: {
    'active':             {icon: activeIcon,                  color: 'text-success'},
    'canceled-rollback':  {icon: 'icon icon-life-ring',       color: 'text-info'},
    'canceled-upgrade':   {icon: 'icon icon-life-ring',       color: 'text-info'},
    'canceling-rollback': {icon: 'icon icon-life-ring',       color: 'text-info'},
    'canceling-upgrade':  {icon: 'icon icon-life-ring',       color: 'text-info'},
    'finishing-upgrade':  {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
    'rolling-back':       {icon: 'icon icon-history',         color: 'text-info'},
    'upgraded':           {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
    'upgrading':          {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
  }
});

export default Service;
