import { later, cancel } from '@ember/runloop';
import { computed, get, set } from '@ember/object';
import { alias, gt } from '@ember/object/computed';

import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import { sortableNumericSuffix } from 'shared/utils/util';
import { formatSi } from 'shared/utils/parse-unit';
import { reference, hasMany } from 'ember-api-store/utils/denormalize';
import StateCounts from 'ui/mixins/state-counts';
import EndpointPorts from 'ui/mixins/endpoint-ports';
import { inject as service } from "@ember/service";
import DisplayImage from 'shared/mixins/display-image';

var Workload = Resource.extend(DisplayImage, StateCounts, EndpointPorts, {
  intl:          service(),
  growl:         service(),
  modalService:  service('modal'),
  allWorkloads:  service(),
  scope:         service(),
  router:        service(),
  clusterStore: service(),

  namespace: reference('namespaceId', 'namespace', 'clusterStore'),
  pods:         hasMany('id', 'pod', 'workloadId'),

  init() {
    this._super(...arguments);
    this.defineStateCounts('pods', 'podStates', 'podCountSort');
  },

  lcType: computed('type', function() {
    return (get(this, 'type')||'').toLowerCase();
  }),

  actions: {
    editDns() {
      get(this, 'modalService').toggleModal('modal-edit-dns', this);
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
      get(this, 'modalService').toggleModal('modal-rollback-service', {
        originalModel: this
      });
    },

    garbageCollect() {
      return this.doAction('garbagecollect');
    },

    // Start and stop are only here to mimic the same actions that exist on a container
    // the reason being bulkActions, to forgo writing distinct logic for containers vs
    // services lets just mimic the actions here.
    start() {
      return this.doAction('activate');
    },

    stop() {
      return this.doAction('deactivate');
    },

    promptStop() {
      get(this, 'modalService').toggleModal('modal-container-stop', {
        model: [this]
      });
    },

    scaleUp() {
      let scale = get(this, 'scale');
      let max = get(this, 'scaleMax');
      scale += get(this, 'scaleIncrement')||1;
      if ( max ) {
        scale = Math.min(scale, max);
      }
      set(this, 'scale', scale);
      this.saveScale();
    },

    scaleDown() {
      let scale = get(this, 'scale');
      let min = get(this, 'scaleMin') || 0;
      scale -= get(this, 'scaleIncrement')||1;
      scale = Math.max(scale, min);
      set(this, 'scale', scale);
      this.saveScale();
    },

    upgrade(upgradeImage='false') {
      var route = 'containers.run';
      if ( get(this, 'lcType') === 'loadbalancerservice' ) {
        route = 'balancers.run';
      }

      get(this, 'router').transitionTo(route, {queryParams: {
        workloadId: get(this, 'id'),
        upgrade: true,
        upgradeImage: upgradeImage,
        stackId: get(this, 'stackId'),
      }});
    },

    clone() {
      var route;
      switch ( get(this, 'lcType') )
      {
        case 'service':             route = 'containers.run'; break;
        case 'workload':            route = 'containers.run'; break;
        case 'scalinggroup':        route = 'containers.run'; break;
        case 'dnsservice':          route = 'dns.new';        break;
        case 'loadbalancerservice': route = 'balancers.run';  break;
        case 'externalservice':     route = 'dns.new';        break;
        default: return void this.send('error','Unknown service type: ' + get(this, 'type'));
      }

      get(this, 'router').transitionTo(route, {queryParams: {
        workloadId: get(this, 'id'),
      }});
    },

    addSidekick() {
      get(this, 'router').transitionTo('containers.run', {queryParams: {
        serviceId: get(this, 'id'),
        addSidekick: true,
        launchConfigIndex: (get(this, 'secondaryLaunchConfigs')||[]).length
      }});
    },

    shell() {
      get(this, 'modalService').toggleModal('modal-shell', {
        model: get(this, 'containerForShell'),
        escToClose: false,
      });
    },

    popoutShell() {
      let proj = get(this, 'scope.currentProject.id');
      let id = get(this, 'containerForShell.id');
      later(() => {
        window.open(`//${window.location.host}/env/${proj}/infra/console?instanceId=${id}&isPopup=true`, '_blank', "toolbars=0,width=900,height=700,left=200,top=200");
      });
    },
  },

  scaleTimer: null,
  saveScale() {
    if ( get(this, 'scaleTimer') )
    {
      cancel(get(this, 'scaleTimer'));
    }

    var timer = later(this, function() {
      this.save().catch((err) => {
        get(this, 'growl').fromError('Error updating scale',err);
      });
    }, 500);

    set(this, 'scaleTimer', timer);
  },

  availableActions: function() {
    let a = get(this, 'actionLinks');
    let l = get(this, 'links');

    let isReal = get(this, 'isReal');
    let canHaveContainers = get(this, 'canHaveContainers');
    let containerForShell = get(this, 'containerForShell');
    let canCleanup = !!a.garbagecollect && get(this, 'canCleanup');

    let choices = [
      { label: 'action.edit',           icon: 'icon icon-edit',             action: 'upgrade',        enabled: !!l.update &&  isReal },
      { label: 'action.edit',           icon: 'icon icon-pencil',           action: 'editDns',        enabled: !!l.update && !isReal },
      { label: 'action.rollback',       icon: 'icon icon-history',          action: 'rollback',       enabled: !!a.rollback && isReal && !!get(this, 'previousRevisionId') },
      { label: 'action.garbageCollect', icon: 'icon icon-garbage',          action: 'garbageCollect', enabled: canCleanup},
      { label: 'action.clone',          icon: 'icon icon-copy',             action: 'clone',          enabled: true},
      { label: 'action.addSidekick',    icon: 'icon icon-plus-circle',      action: 'addSidekick',    enabled: get(this, 'canHaveSidekicks') },
      { divider: true },
      { label: 'action.execute',        icon: 'icon icon-terminal',         action: 'shell',          enabled: !!containerForShell, altAction:'popoutShell'},
//      { label: 'action.logs',           icon: 'icon icon-file',             action: 'logs',           enabled: !!a.logs, altAction: 'popoutLogs' },
      { divider: true },
      { label: 'action.pause',          icon: 'icon icon-pause',            action: 'pause',          enabled: !!a.pause, bulkable: true},
      { label: 'action.start',          icon: 'icon icon-play',             action: 'start',          enabled: !!a.activate, bulkable: true},
      { label: 'action.restart',        icon: 'icon icon-refresh',          action: 'restart',        enabled: !!a.restart && canHaveContainers, bulkable: true },
      { label: 'action.stop',           icon: 'icon icon-stop',             action: 'promptStop',     enabled: !!a.deactivate, altAction: 'stop', bulkable: true},
      { divider: true },
      { label: 'action.remove',         icon: 'icon icon-trash',            action: 'promptDelete',   enabled: !!l.remove, altAction: 'delete', bulkable: true},
      { divider: true },
      { label: 'action.viewInApi',      icon: 'icon icon-external-link',    action: 'goToApi',        enabled: true },
    ];

    return choices;
  }.property('actionLinks.{activate,deactivate,pause,restart,rollback,garbagecollect}','links.{update,remove}','previousRevisionId',
    'canHaveContainers','canHaveSidekicks','containerForShell'
  ),

  sortName: function() {
    return sortableNumericSuffix(get(this, 'displayName'));
  }.property('displayName'),

  linkedServices: function() {
    let allWorkloads = get(this, 'allWorkloads');
    let stack = get(this, 'stack');
    return (get(this, 'serviceLinks')||[]).map((link) => {
      return {
        name: link.name,
        alias: link.alias,
        service: allWorkloads.matching(link.name, stack),
      };
    });
  }.property('serviceLinks.@each.{name,alias}'),

  combinedState: function() {
    var service = get(this, 'state');
    var health = get(this, 'healthState');

    if ( service === 'active' && health ) {
      // Return the health state for active services
      return health;
    }

    // Return the service for anything else
    return service;
  }.property('state', 'healthState'),

  isGlobalScale: function() {
    return (get(this, 'launchConfig.labels')||{})[C.LABEL.SCHED_GLOBAL] + '' === 'true';
  }.property('launchConfig.labels'),

  canScaleUp: function() {
    if ( !get(this, 'canScale') ) {
      return false;
    }

    let scale = get(this, 'scale');
    let max = get(this, 'scaleMax');
    if ( !max ) {
      return true;
    }

    scale += get(this, 'scaleIncrement')||1;
    return scale <= max;
  }.property('canScale','scaleMax','scaleIncrement','scale'),

  canScaleDown: function() {
    if ( !get(this, 'canScale') ) {
      return false;
    }

    let scale = get(this, 'scale');
    let min = get(this, 'scaleMin')||1;

    scale -= get(this, 'scaleIncrement')||1;
    return scale >= min;
  }.property('canScale','scaleMin','scaleIncrement','scale'),

  displayScale: function() {
    if ( get(this, 'isGlobalScale') ) {
      return get(this, 'intl').t('servicePage.globalScale', {scale: get(this, 'scale')});
    } else {
      return get(this, 'scale');
    }
  }.property('scale','isGlobalScale'),

  canHaveContainers: function() {
    if ( get(this, 'isReal') || get(this, 'isSelector') ) {
      return true;
    }

    return [
      'kubernetesservice',
      'composeservice',
    ].includes(get(this, 'lcType'));
  }.property('isReal','isSelector','lcType'),

  isReal: true,
  isSelector: false,

  canHaveSidekicks: function() {
    return ['service','scalinggroup'].includes(get(this, 'lcType'));
  }.property('lcType'),

  hasPorts: alias('isReal'),
  hasImage: alias('isReal'),
  canUpgrade: alias('isReal'),
  canHaveLabels: alias('isReal'),
  canScale: alias('isReal'),

  realButNotLb: function() {
    return get(this, 'isReal') && !get(this, 'isBalancer');
  }.property('isReal','isBalancer'),

  canHaveLinks: alias('realButNotLb'),
  canChangeNetworking: alias('realButNotLb'),
  canChangeSecurity: alias('realButNotLb'),
  canHaveSecrets: alias('realButNotLb'),
  canHaveEnvironment: alias('realButNotLb'),

  canHaveHealthCheck: function() {
    return [
      'service',
      'scalinggroup',
      'externalservice',
    ].includes(get(this, 'lcType'));
  }.property('lcType'),

  isBalancer: function() {
    return ['loadbalancerservice'].indexOf(get(this, 'lcType')) >= 0;
  }.property('lcType'),

  canBalanceTo: function() {
    if ( get(this, 'lcType') === 'externalservice' && get(this, 'hostname') !== null) {
      return false;
    }

    return true;
  }.property('lcType','hostname'),

  isK8s: function() {
    return ['kubernetesservice'].indexOf(get(this, 'lcType')) >= 0;
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

    let type = get(this, 'lcType');
    if ( get(this, 'isSelector') ) {
      type = 'selectorservice';
    }

    if ( !known.includes(type) ) {
      type = 'service';
    }

    if ( type === 'externalservice' ) {
      if ( get(this, 'hostname') ) {
        type += '-host';
      } else {
        type += '-ip';
      }
    }

    return get(this, 'intl').t('servicePage.type.'+ type);
  }.property('lcType','isSelector','intl.locale'),

  hasSidekicks: gt('containers.length', 1),

  activeIcon: function() {
    return activeIcon(this);
  }.property('lcType'),

  memoryReservationBlurb: computed('launchConfig.memoryReservation', function() {
    if ( get(this, 'launchConfig.memoryReservation') ) {
      return formatSi(get(this, 'launchConfig.memoryReservation'), 1024, 'iB', 'B');
    }
  }),

  containerForShell: function() {
    return get(this, 'pods').findBy('combinedState','running');
  }.property('pods.@each.combinedState'),

  canCleanup: function() {
    return !!get(this, 'pods').findBy('desired',false);
  }.property('pods.@each.desired'),
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

Workload.reopenClass({
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

export default Workload;
