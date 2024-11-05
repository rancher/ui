import { later, cancel } from '@ember/runloop';
import { computed, get, set } from '@ember/object';
import Grafana from 'shared/mixins/grafana';
import { alias, gt, not } from '@ember/object/computed';
import Resource from 'ember-api-store/models/resource';
import { sortableNumericSuffix } from 'shared/utils/util';
import { formatSi } from 'shared/utils/parse-unit';
import { reference, hasMany } from 'ember-api-store/utils/denormalize';
import StateCounts from 'ui/mixins/state-counts';
import EndpointPorts from 'ui/mixins/endpoint-ports';
import { inject as service } from '@ember/service';
import DisplayImage from 'shared/mixins/display-image';
import C from 'shared/utils/constants';

const WORKLOAD_CONFIG_FIELDS = ['cronJobConfig', 'daemonSetConfig', 'deploymentConfig', 'jobConfig', 'replicaSetConfig', 'replicationControllerConfig', 'statefulSetConfig']

var Workload = Resource.extend(Grafana, DisplayImage, StateCounts, EndpointPorts, {
  intl:          service(),
  growl:         service(),
  modalService:  service('modal'),
  scope:         service(),
  router:        service(),
  clusterStore: service(),

  pods: hasMany('id', 'pod', 'workloadId'),

  scaleTimer: null,

  // @TODO-2.0 cleanup all these...
  hasPorts:            true,
  canUpgrade:          true,
  canHaveLabels:       true,
  realButNotLb:        true,
  canHaveLinks:        true,
  canChangeNetworking: true,
  canChangeSecurity:   true,
  canHaveSecrets:      true,
  canHaveEnvironment:  true,
  canHaveHealthCheck:  true,
  isBalancer:          false,
  canBalanceTo:         true,

  grafanaResourceId: alias('name'),

  namespace:    reference('namespaceId', 'namespace', 'clusterStore'),
  canClone:  not('hasSidekicks'),

  hasSidekicks: gt('containers.length', 1),

  launchConfig: alias('containers.firstObject'),

  canScaleUp: alias('canScale'),

  init() {
    this._super(...arguments);
    this.defineStateCounts('pods', 'podStates', 'podCountSort');
  },

  restarts: computed('pods.@each.restarts', function() {
    let out = 0;

    (this.pods || []).forEach((pod) => {
      out += get(pod, 'restarts');
    });

    return out;
  }),

  lcType: computed('type', function() {
    return (this.type || '').toLowerCase();
  }),

  canEdit: computed('links.update', 'lcType', function() {
    const lcType = this.lcType;

    return !!get(this, 'links.update') && ( lcType !== 'job' );
  }),

  availableActions: computed('actionLinks.{activate,deactivate,pause,restart,rollback,garbagecollect}', 'links.{update,remove}', 'podForShell', 'isPaused', 'canEdit', function() {
    const a = this.actionLinks || {};

    const podForShell = this.podForShell;

    const isPaused = this.isPaused;
    const canEdit = this.canEdit;

    let choices = [
      {
        label:    'action.redeploy',
        icon:     'icon icon-refresh',
        action:   'redeploy',
        enabled:  canEdit,
        bulkable: true,
      },
      {
        label:   'action.addSidekick',
        icon:    'icon icon-plus-circle',
        action:  'addSidekick',
      },
      {
        label:   'action.rollback',
        icon:    'icon icon-history',
        action:  'rollback',
        enabled: !!a.rollback,
      },
      { divider: true },
      {
        label:     'action.execute',
        icon:      'icon icon-terminal',
        action:    'shell',
        enabled:   !!podForShell,
        altAction: 'popoutShell'
      },
      //      { label: 'action.logs',           icon: 'icon icon-file',             action: 'logs',           enabled: !!a.logs, altAction: 'popoutLogs' },
      { divider: true },
      {
        label:    'action.pause',
        icon:     'icon icon-pause',
        action:   'pause',
        enabled:  !!a.pause && !isPaused,
        bulkable: true
      },
      {
        label:    'action.resume',
        icon:     'icon icon-play',
        action:   'resume',
        enabled:  !!a.pause && isPaused,
        bulkable: true
      },
    ];

    return choices;
  }),

  displayType: computed('type', function() {
    let type = this.type;

    return this.intl.t(`servicePage.serviceType.${ type }`);
  }),

  sortName: computed('displayName', function() {
    return sortableNumericSuffix(this.displayName);
  }),

  combinedState: computed('state', 'healthState', function() {
    var service = this.state;
    var health = this.healthState;

    if ( service === 'active' && health ) {
      // Return the health state for active services
      return health;
    }

    // Return the service for anything else
    return service;
  }),

  isGlobalScale: computed('lcType', function() {
    let lcType = this.lcType;

    return lcType === 'daemonset';
  }),

  canScaleDown: computed('canScale', 'scale', function() {
    return this.canScale && this.scale > 0;
  }),

  displayScale: computed('scale', 'isGlobalScale', 'lcType', function() {
    if ( this.isGlobalScale ) {
      return this.intl.t('servicePage.multistat.daemonSetScale');
    } else {
      return this.scale;
    }
  }),

  canScale: computed('lcType', function() {
    let lcType = this.lcType;

    return lcType !== 'cronjob' && lcType !== 'daemonset' && lcType !== 'job';
  }),

  activeIcon: computed('lcType', function() {
    return activeIcon(this);
  }),

  memoryReservationBlurb: computed('launchConfig.memoryReservation', function() {
    if ( get(this, 'launchConfig.memoryReservation') ) {
      return formatSi(get(this, 'launchConfig.memoryReservation'), 1024, 'iB', 'B');
    }

    return '';
  }),

  podForShell: computed('pods.@each.canShell', function() {
    return this.pods.findBy('canShell', true);
  }),

  secondaryLaunchConfigs: computed('containers.[]', function() {
    return (this.containers || []).slice(1);
  }),

  isCreatedByRancher: computed('workloadAnnotations', function() {
    const workloadAnnotations = this.workloadAnnotations || {};

    return !!workloadAnnotations[C.LABEL.CREATOR_ID];
  }),

  currentScale: computed('pods.@each.state', 'scale', function() {
    const { pods = [] } = this

    return pods.filter((p) => p.state === 'running').length
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
      return this.doAction('resume');
    },

    restart() {
      return this.doAction('restart', { rollingRestartStrategy: {} });
    },

    rollback() {
      this.modalService.toggleModal('modal-rollback-service', { originalModel: this });
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
      this.modalService.toggleModal('modal-container-stop', { model: [this] });
    },

    scaleUp() {
      set(this, 'scale', this.scale + 1);
      this.saveScale();
    },

    scaleDown() {
      let scale = this.scale;

      scale -= 1;
      scale = Math.max(scale, 0);
      set(this, 'scale', scale);
      this.saveScale();
    },

    edit(upgradeImage = 'false') {
      var route = 'containers.run';

      if ( this.lcType === 'loadbalancerservice' ) {
        route = 'balancers.run';
      }

      this.router.transitionTo(route, {
        queryParams: {
          workloadId:   this.id,
          upgrade:      true,
          upgradeImage,
          namespaceId:  this.namespaceId,
        }
      });
    },

    clone() {
      this.router.transitionTo('containers.run', { queryParams: { workloadId: this.id, } });
    },

    redeploy() {
      if ( this.hasAction('redeploy') ) {
        this.doAction('redeploy');
      } else {
        this.updateTimestamp();
        this.save();
      }
    },

    addSidekick() {
      this.router.transitionTo('containers.run', {
        queryParams: {
          workloadId:  this.id,
          addSidekick: true,
        }
      });
    },

    shell() {
      this.modalService.toggleModal('modal-shell', { model: this.podForShell, });
    },

    popoutShell() {
      const projectId = get(this, 'scope.currentProject.id');
      const podId = get(this, 'podForShell.id');
      const route = this.router.urlFor('authenticated.project.console', projectId);

      const system = get(this, 'podForShell.node.info.os.operatingSystem') || ''
      let windows = false;

      if (system.startsWith('Windows')) {
        windows = true;
      }

      later(() => {
        const opt = 'toolbars=0,width=900,height=700,left=200,top=200';

        window.open(`//${ window.location.host }${ route }?podId=${ podId }&windows=${ windows }&isPopup=true`, '_blank', opt);
      });
    },
  },

  updateTimestamp() {
    let obj = this.annotations;

    if ( !obj ) {
      obj = {};
      set(this, 'annotations', obj);
    }

    obj[C.LABEL.TIMESTAMP] = (new Date()).toISOString().replace(/\.\d+Z$/, 'Z');
  },

  saveScale() {
    if ( this.scaleTimer ) {
      cancel(this.scaleTimer);
    }
    const scale = this.scale;

    var timer = later(this, function() {
      this.save({ data: { scale } }).catch((err) => {
        this.growl.fromError('Error updating scale', err);
      });
    }, 500);

    set(this, 'scaleTimer', timer);
  },

  clearConfigsExcept(keep) {
    const keys = this.allKeys().filter((x) => WORKLOAD_CONFIG_FIELDS.indexOf(x) > -1);

    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( key !== keep && get(this, key) ) {
        set(this, key, null);
      }
    }
  },

});

export function activeIcon(workload) {
  var out = 'icon icon-services';

  switch ( workload.get('lcType') ) {
  case 'pod':                 out = 'icon icon-container'; break;
  case 'cronjob':             out = 'icon icon-backup';    break;
  case 'job':                 out = 'icon icon-file';      break;
  case 'daemonset':           out = 'icon icon-globe';     break;
  case 'statefulset':         out = 'icon icon-database';  break;
  }

  return out;
}

Workload.reopenClass({
  stateMap: {
    'active':             {
      icon:  activeIcon,
      color: 'text-success'
    },
  },

  mangleIn(data) {
    if ( data ) {
      const publicEndpoints = get(data, 'publicEndpoints') || [];
      const containers = get(data, 'containers') || [];

      publicEndpoints.forEach((endpoint) => {
        endpoint.type = 'publicEndpoint';
      });
      containers.forEach((container) => {
        container.type = 'container';
      });
    }

    return data;
  }
});

export default Workload;
