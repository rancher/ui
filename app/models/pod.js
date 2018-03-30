import C from 'ui/utils/constants';
import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { get, computed } from '@ember/object';
import { inject as service } from "@ember/service";
import { strPad } from 'ui/utils/util';
import { formatSi } from 'shared/utils/parse-unit';
import { later } from '@ember/runloop';
import DisplayImage from 'shared/mixins/display-image';

var Pod = Resource.extend(DisplayImage, {
  router: service(),
  modalService:  service('modal'),
  globalStore:  service(),
  clusterStore:  service(),
  scope: service(),

  namespace: reference('namespaceId','namespace','clusterStore'),
  node: reference('nodeId','node','globalStore'),
  workload: reference('workloadId'),

  actions: {
    clone() {
      get(this, 'router').transitionTo('containers.run', {queryParams: {
        podId: get(this, 'id'),
      }});
    },

    shell() {
      get(this, 'modalService').toggleModal('modal-shell', {
        model: this,
        escToClose: false,
      });
    },

    popoutShell() {
      const projectId = get(this, 'scope.currentProject.id');
      const podId = get(this, 'id');
      const route = get(this,'router').urlFor('authenticated.project.console', projectId);
      later(() => {
        window.open(`//${window.location.host}${route}?podId=${podId}&isPopup=true`, '_blank', "toolbars=0,width=900,height=700,left=200,top=200");
      });
    },

    logs: function() {
      get(this, 'modalService').toggleModal('modal-container-logs', this);
    },

    popoutLogs() {
      const projectId = get(this, 'scope.currentProject.id');
      const podId = get(this, 'id');
      const route = get(this,'router').urlFor('authenticated.project.container-log', projectId);
      later(() => {
        window.open(`//${window.location.host}${route}?podId=${podId}&isPopup=true`, '_blank', "toolbars=0,width=900,height=700,left=200,top=200");
      });
    },
  },

  availableActions: computed('actionLinks.{restart,start,stop}','links.{remove}','workload.links.update', function() {
    const a = get(this,'actionLinks');
    const l = get(this,'links');

    let isRunning = get(this, 'combinedState') === 'running';

    var choices = [
      { label: 'action.execute',          icon: 'icon icon-terminal',     action: 'shell',            enabled: isRunning, altAction:'popoutShell'},
      { label: 'action.logs',             icon: 'icon icon-file',         action: 'logs',             enabled: isRunning, altAction: 'popoutLogs' },
      { divider: true },
      { label: 'action.remove',           icon: 'icon icon-trash',        action: 'promptDelete',     enabled: !!l.remove, altAction: 'delete', bulkable: true},
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',action: 'goToApi',          enabled: true },
    ];

    return choices;
  }),

  memoryReservationBlurb: computed('memoryReservation', function() {
    if ( get(this,'memoryReservation') ) {
      return formatSi(get(this,'memoryReservation'), 1024, 'iB', 'B');
    }
  }),

  combinedState: computed('node.state','workload.state','state','healthState','healthCheck', function() {
    var node = get(this,'node.state');
    var resource = get(this,'state');
    //var workload = get(this,'workload.state');
    var health = get(this,'healthState');
    var hasCheck = !!get(this,'healthCheck');

    if ( !hasCheck && C.DISCONNECTED_STATES.includes(node) ) {
      return 'unknown';
    } else if ( C.ACTIVEISH_STATES.includes(resource) && health ) {
      return health;
    } else {
      return resource;
    }
  }),
  image: function () {
    let containers = this.get('containers');
    if(!containers.length){
      return
    }
    return containers[0].image;
  }.property('containers'),
  isOn: function() {
    return ['running','migrating','restarting'].indexOf(get(this,'state')) >= 0;
  }.property('state'),

  displayState: computed('_displayState','exitCode', function() {
    let out = get(this,'_displayState');
    let code = get(this,'exitCode');
    if ( get(this,'state') === 'stopped' && get(this,'exitCode') > 0) {
      out += ' (' + code + ')';
    }

    return out;
  }),

  displayEnvironmentVars: computed('environment', function() {
    var envs = [];
    var environment = get(this,'environment')||{};
    Object.keys(environment).forEach((key) => {
      envs.pushObject({key: key, value: environment[key]})
    });
    return envs;
  }),

  displayIp: function() {
    return get(this,'status.podIp') || null;
  }.property('status.podIp'),

  sortIp: function() {
    var ip = get(this,'primaryAssociatedIpAddress') || get(this,'primaryIpAddress');
    if ( !ip ) {
      return '';
    }
    var match = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if ( match )
    {
      return match.slice(1).map((octet) => { return strPad(octet,3,'0',false); }).join(".");
    }
  }.property('primaryIpAddress','primaryAssociatedIpAddress'),

  isGlobalScale: function() {
    return (get(this,'labels')||{})[C.LABEL.SCHED_GLOBAL] + '' === 'true';
  }.property('labels'),

  hasLabel(key, desiredValue) {
    const labels = get(this, 'labels')||{};
    const value = get(labels, key);
    if ( value === undefined ) {
      return false;
    }

    if ( desiredValue === undefined ) {
      return true;
    }

    return ( value === desiredValue );
  }
});

export function stoppedIcon(inst)
{
  if ( inst.get('restartPolicy.name') === 'no' && inst.get('exitCode') === 0 ) {
    return 'icon icon-dot-circlefill';
  }

  return 'icon icon-circle';
}

export function stoppedColor(inst)
{
  if ( inst.get('restartPolicy.name') === 'no' && inst.get('exitCode') === 0 ) {
    return 'text-success';
  }

  return 'text-error';
}

Pod.reopenClass({
  stateMap: {
    'stopped': {icon: stoppedIcon, color: stoppedColor},
  },
});

export default Pod;
