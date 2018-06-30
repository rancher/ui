import { later, cancel } from '@ember/runloop';
import {
  computed, get, set
} from '@ember/object';
import {
  alias, gt, not
} from '@ember/object/computed';

import Resource from 'ember-api-store/models/resource';
import { sortableNumericSuffix } from 'shared/utils/util';
import { formatSi } from 'shared/utils/parse-unit';
import { reference, hasMany } from 'ember-api-store/utils/denormalize';
import StateCounts from 'ui/mixins/state-counts';
import EndpointPorts from 'ui/mixins/endpoint-ports';
import { inject as service } from '@ember/service';
import DisplayImage from 'shared/mixins/display-image';

var Workload = Resource.extend(DisplayImage, StateCounts, EndpointPorts, {
  pods:         hasMany('id', 'pod', 'workloadId'),

  namespace:    reference('namespaceId', 'namespace', 'clusterStore'),
  canClone:  not('hasSidekicks'),

  hasSidekicks: gt('containers.length', 1),

  launchConfig:           alias('containers.firstObject'),
  lcType:       computed('type', function() {

    return (get(this, 'type') || '').toLowerCase();

  }),

  canEdit: computed('links.update', 'isReal', function() {

    return !!get(this, 'links.update') && get(this, 'isReal');

  }),

  availableActions: function() {

    let a = get(this, 'actionLinks');

    let isReal = get(this, 'isReal');
    let podForShell = get(this, 'podForShell');

    let isPaused = get(this, 'isPaused');

    let choices = [
      {
        label:   'action.addSidekick',
        icon:    'icon icon-plus-circle',
        action:  'addSidekick',
        enabled: get(this, 'canHaveSidekicks')
      },
      {
        label:   'action.rollback',
        icon:    'icon icon-history',
        action:  'rollback',
        enabled: !!a.rollback && isReal
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

  }.property('actionLinks.{activate,deactivate,pause,restart,rollback,garbagecollect}', 'links.{update,remove}',
    'canHaveSidekicks', 'podForShell', 'isPaused'
  ),
  displayType: function() {

    let type = this.get('type');

    return get(this, 'intl').t(`servicePage.serviceType.${ type }`);

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

    let lcType = get(this, 'lcType');

    return lcType === 'daemonset';

  }.property('lcType'),

  canScaleUp: function() {

    if ( !get(this, 'canScale') ) {

      return false;

    }

    let scale = get(this, 'scale');
    let max = get(this, 'scaleMax');

    if ( !max ) {

      return true;

    }

    scale += get(this, 'scaleIncrement') || 1;

    return scale <= max;

  }.property('canScale', 'scaleMax', 'scaleIncrement', 'scale'),

  canScaleDown: function() {

    if ( !get(this, 'canScale') ) {

      return false;

    }

    let scale = get(this, 'scale');
    let min = get(this, 'scaleMin') || 1;

    scale -= get(this, 'scaleIncrement') || 1;

    return scale >= min;

  }.property('canScale', 'scaleMin', 'scaleIncrement', 'scale'),

  displayScale: function() {

    if ( get(this, 'isGlobalScale') ) {

      return get(this, 'intl').t('servicePage.multistat.daemonSetScale');

    } else {

      return get(this, 'scale');

    }

  }.property('scale', 'isGlobalScale', 'lcType'),

  canScale:      computed('lcType', function() {

    let lcType = get(this, 'lcType');

    return  lcType !== 'cronjob' && lcType !== 'daemonset';

  }),
  activeIcon: function() {

    return activeIcon(this);

  }.property('lcType'),

  memoryReservationBlurb: computed('launchConfig.memoryReservation', function() {

    if ( get(this, 'launchConfig.memoryReservation') ) {

      return formatSi(get(this, 'launchConfig.memoryReservation'), 1024, 'iB', 'B');

    }

  }),

  podForShell: function() {

    return get(this, 'pods').findBy('combinedState', 'running');

  }.property('pods.@each.combinedState'),

  secondaryLaunchConfigs: computed('containers.[]', function() {

    return (get(this, 'containers') || []).slice(1);

  }),
  intl:          service(),
  growl:         service(),
  modalService:  service('modal'),
  scope:         service(),
  router:        service(),
  clusterStore: service(),

  init() {

    this._super(...arguments);
    this.defineStateCounts('pods', 'podStates', 'podCountSort');

  },

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

      get(this, 'modalService').toggleModal('modal-rollback-service', { originalModel: this });

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

      get(this, 'modalService').toggleModal('modal-container-stop', { model: [this] });

    },

    scaleUp() {

      let scale = get(this, 'scale');
      let max = get(this, 'scaleMax');

      scale += get(this, 'scaleIncrement') || 1;
      if ( max ) {

        scale = Math.min(scale, max);

      }
      set(this, 'scale', scale);
      this.saveScale();

    },

    scaleDown() {

      let scale = get(this, 'scale');
      let min = get(this, 'scaleMin') || 0;

      scale -= get(this, 'scaleIncrement') || 1;
      scale = Math.max(scale, min);
      set(this, 'scale', scale);
      this.saveScale();

    },

    edit(upgradeImage = 'false') {

      var route = 'containers.run';

      if ( get(this, 'lcType') === 'loadbalancerservice' ) {

        route = 'balancers.run';

      }

      get(this, 'router').transitionTo(route, {
        queryParams: {
          workloadId:   get(this, 'id'),
          upgrade:      true,
          upgradeImage,
          namespaceId:  get(this, 'namespaceId'),
        }
      });

    },

    clone() {

      get(this, 'router').transitionTo('containers.run', { queryParams: { workloadId: get(this, 'id'), } });

    },

    addSidekick() {

      get(this, 'router').transitionTo('containers.run', {
        queryParams: {
          workloadId:  get(this, 'id'),
          addSidekick: true,
        }
      });

    },

    shell() {

      get(this, 'modalService').toggleModal('modal-shell', { model: get(this, 'podForShell'), });

    },

    popoutShell() {

      const projectId = get(this, 'scope.currentProject.id');
      const podId = get(this, 'podForShell.id');
      const route = get(this, 'router').urlFor('authenticated.project.console', projectId);

      later(() => {

        window.open(`//${ window.location.host }${ route }?podId=${ podId }&isPopup=true`, '_blank', 'toolbars=0,width=900,height=700,left=200,top=200');

      });

    },
  },

  scaleTimer: null,
  saveScale() {

    if ( get(this, 'scaleTimer') ) {

      cancel(get(this, 'scaleTimer'));

    }

    var timer = later(this, function() {

      this.save().catch((err) => {

        get(this, 'growl').fromError('Error updating scale', err);

      });

    }, 500);

    set(this, 'scaleTimer', timer);

  },

  canHaveSidekicks: true,

  // @TODO-2.0 cleanup all these...
  isReal:              true,
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

  canBalanceTo: true,

  clearConfigsExcept(keep) {

    const keys = this.allKeys().filter((x) => x.endsWith('Config'));

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

    if ( data && data.publicEndpoints ) {

      data.publicEndpoints.forEach((endpoint) => {

        endpoint.type = 'publicEndpoint';

      })

    }

    return data;

  }
});

export default Workload;
