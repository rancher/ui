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
    activate() {
      return this.doAction('activate');
    },

    deactivate() {
      return this.doAction('deactivate');
    },

    pause() {
      return this.doAction('pause');
    },

    resume() {
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
        namespaceId: get(this, 'namespaceId'),
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
        workloadId: get(this, 'id'),
        addSidekick: true,
      }});
    },

    shell() {
      get(this, 'modalService').toggleModal('modal-shell', {
        model: get(this, 'podForShell'),
        escToClose: false,
      });
    },

    popoutShell() {
      const projectId = get(this, 'scope.currentProject.id');
      const podId = get(this, 'podForShell.id');
      const route = get(this,'router').urlFor('authenticated.project.console', projectId);
      later(() => {
        window.open(`//${window.location.host}${route}?podId=${podId}&isPopup=true`, '_blank', "toolbars=0,width=900,height=700,left=200,top=200");
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
    let podForShell = get(this, 'podForShell');

    let isPaused = get(this, 'isPaused');

    let choices = [
      { label: 'action.edit',           icon: 'icon icon-edit',             action: 'upgrade',        enabled: !!l.update &&  isReal },
      { label: 'action.rollback',       icon: 'icon icon-history',          action: 'rollback',       enabled: !!a.rollback && isReal },
//      { label: 'action.clone',          icon: 'icon icon-copy',             action: 'clone',          enabled: true},
      { label: 'action.addSidekick',    icon: 'icon icon-plus-circle',      action: 'addSidekick',    enabled: get(this, 'canHaveSidekicks') },
      { divider: true },
      { label: 'action.execute',        icon: 'icon icon-terminal',         action: 'shell',          enabled: !!podForShell, altAction:'popoutShell'},
//      { label: 'action.logs',           icon: 'icon icon-file',             action: 'logs',           enabled: !!a.logs, altAction: 'popoutLogs' },
      { divider: true },
      { label: 'action.pause',          icon: 'icon icon-pause',            action: 'pause',          enabled: !!a.pause && !isPaused, bulkable: true},
      { label: 'action.resume',         icon: 'icon icon-play',             action: 'resume',          enabled: !!a.pause && isPaused,  bulkable: true},
      { divider: true },
      { label: 'action.remove',         icon: 'icon icon-trash',            action: 'promptDelete',   enabled: !!l.remove, altAction: 'delete', bulkable: true},
      { divider: true },
      { label: 'action.viewInApi',      icon: 'icon icon-external-link',    action: 'goToApi',        enabled: true },
    ];

    return choices;
  }.property('actionLinks.{activate,deactivate,pause,restart,rollback,garbagecollect}','links.{update,remove}',
    'canHaveSidekicks','podForShell', 'isPaused'
  ),
  displayType: function () {
    let type = this.get('type');
    return get(this, 'intl').t(`servicePage.serviceType.${type}`);
  }.property('type'),
  sortName: function() {
    return sortableNumericSuffix(get(this, 'displayName'));
  }.property('displayName'),

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
    let lcType = get(this, 'lcType');
    if (lcType){
      return get(this, 'intl').t('servicePage.multistat.daemonSetScale');
    }
    if ( get(this, 'isGlobalScale') ) {
      return get(this, 'intl').t('servicePage.globalScale', {scale: get(this, 'scale')});
    } else {
      return get(this, 'scale');
    }
  }.property('scale','isGlobalScale', 'lcType'),

  canHaveSidekicks: true,

  // @TODO-2.0 cleanup all these...
  isReal: true,
  hasPorts: true,
  hasImage: true,
  canUpgrade: true,
  canHaveLabels: true,
  canScale: computed('lcType', function() {
    let lcType = get(this, 'lcType');
    return  lcType !== 'cronjob' && lcType !== 'daemonset';
  }),
  realButNotLb: true,
  canHaveLinks: true,
  canChangeNetworking: true,
  canChangeSecurity: true,
  canHaveSecrets: true,
  canHaveEnvironment: true,
  canHaveHealthCheck: true,
  isBalancer: false,

  canBalanceTo: true,

  hasSidekicks: gt('containers.length', 1),

  activeIcon: function() {
    return activeIcon(this);
  }.property('lcType'),

  memoryReservationBlurb: computed('launchConfig.memoryReservation', function() {
    if ( get(this, 'launchConfig.memoryReservation') ) {
      return formatSi(get(this, 'launchConfig.memoryReservation'), 1024, 'iB', 'B');
    }
  }),

  podForShell: function() {
    return get(this, 'pods').findBy('combinedState','running');
  }.property('pods.@each.combinedState'),

  clearConfigsExcept(keep) {
    const keys = this.allKeys().filter(x => x.endsWith('Config'));

    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( key !== keep && get(this,key) ) {
        set(this, key, null);
      }
    }
  },

  launchConfig: alias('containers.firstObject'),
  secondaryLaunchConfigs: computed('containers.[]', function() {
    return (get(this, 'containers')||[]).slice(1);
  }),
});

export function activeIcon(workload)
{
  var out = 'icon icon-services';
  switch ( workload.get('lcType') ) {
    case 'pod':                 out = 'icon icon-container'; break;
    case 'cronjob':             out = 'icon icon-backup';    break;
    case 'daemonset':           out = 'icon icon-globe';     break;
    case 'statefulset':         out = 'icon icon-database';  break;
  }

  return out;
}

Workload.reopenClass({
  stateMap: {
    'active':             {icon: activeIcon,                  color: 'text-success'},
  },

  mangleIn(data) {
    if ( data && data.publicEndpoints ) {
      data.publicEndpoints.forEach((endpoint) => {
        endpoint.type = 'publicEndpoint';
      })
    }
    return data;
  }
});

export default Workload;
