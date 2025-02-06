import { computed, get, set } from '@ember/object';
import { or, alias } from '@ember/object/computed';
import Resource from 'ember-api-store/models/resource';
import { download } from 'shared/utils/util';
import C from 'ui/utils/constants';
import StateCounts from 'ui/mixins/state-counts';
import { inject as service } from '@ember/service';
import { hasMany, reference } from 'ember-api-store/utils/denormalize';
import ResourceUsage from 'shared/mixins/resource-usage';
import Grafana from 'shared/mixins/grafana';
import { next } from '@ember/runloop';

const UNSCHEDULABLE_KEYS = ['node-role.kubernetes.io/etcd', 'node-role.kubernetes.io/controlplane'];
const UNSCHEDULABLE_EFFECTS = ['NoExecute', 'NoSchedule'];

const CONTAINERD = 'containerd://';

var Node = Resource.extend(Grafana, StateCounts, ResourceUsage, {
  modalService: service('modal'),
  settings:     service(),
  prefs:        service(),
  router:       service(),
  globalStore:  service(),
  clusterStore: service(),
  intl:         service(),

  nodes:        hasMany('clusterId', 'node', 'clusterId'),
  type:         'node',
  containerD:   CONTAINERD,
  isContainerD: false,

  grafanaDashboardName: 'Nodes',
  grafanaResourceId:    alias('ipAddress'),

  cluster:  reference('clusterId', 'cluster'),
  nodePool: reference('nodePoolId'),

  displayIp: or('externalIpAddress', 'ipAddress'),

  init() {
    this._super(...arguments);
    this.defineStateCounts('arrangedInstances', 'instanceStates', 'instanceCountSort');
  },

  availableActions: computed('actionLinks.{cordon,drain,uncordon}', 'canScaleDown', 'links.nodeConfig', function() {
    let l = this.links;
    const a = this.actionLinks || {};

    let out = [
      {
        label:    'action.cordon',
        icon:     'icon icon-pause',
        action:   'cordon',
        enabled:  !!a.cordon,
        bulkable: true
      },
      {
        label:    'action.uncordon',
        icon:     'icon icon-play',
        action:   'uncordon',
        enabled:  !!a.uncordon,
        bulkable: true
      },
      {
        label:    'action.drain',
        icon:     'icon icon-snapshot',
        action:   'drain',
        enabled:  !!a.drain,
        bulkable: true
      },
      {
        label:    'action.scaledown',
        icon:     'icon icon-arrow-circle-up icon-rotate-180',
        action:   'scaledown',
        enabled:  this.canScaleDown,
        bulkable: true
      },
      {
        label:    'action.stopDrain',
        icon:     'icon icon-stop',
        action:   'stopDrain',
        enabled:  !!a.stopDrain,
        bulkable: true,
      },
      { divider: true },
      {
        label:   'action.nodeConfig',
        icon:    'icon icon-download',
        action:  'nodeConfig',
        enabled: !!l.nodeConfig
      },
      { divider: true },
    ];

    return out;
  }),

  canScaleDown: computed('actionLinks.scaledown', 'nodePool.quantity', function() {
    const actions = this.actionLinks;
    const nodePool = this.nodePool;

    return !!actions?.scaledown && nodePool?.quantity > 1;
  }),

  displayName: computed('id', 'name', 'nodeName.length', 'nodes', 'requestedHostname', function() {
    let name = this.name;

    if ( name ) {
      return name;
    }

    name = this.nodeName;
    if ( name ) {
      if ( name.match(/[a-z]/i) ) {
        name = this.parseNodeName(name);
      }

      return name;
    }

    name = this.requestedHostname;
    if ( name ) {
      return name;
    }

    return `(${ this.id })`;
  }),

  rolesArray: computed('etcd', 'controlPlane', 'worker', function() {
    return ['etcd', 'controlPlane', 'worker'].filter((x) => !!get(this, x));
  }),

  displayRoles: computed('intl.locale', 'rolesArray.[]', function() {
    const intl = this.intl;
    const roles = this.rolesArray;

    if ( roles.length >= 3 ) {
      return [intl.t('generic.all')];
    }

    return roles.map((role) => {
      let key = `model.machine.role.${ role }`;

      if ( intl.exists(key) ) {
        return intl.t(key);
      }

      return key;
    });
  }),

  sortRole: computed('rolesArray.[]', function() {
    let roles = this.rolesArray;

    if ( roles.length >= 3 ) {
      return 1;
    }

    if ( roles.includes('controlPlane') ) {
      return 2;
    }

    if ( roles.includes('etcd') ) {
      return 3;
    }

    return 4;
  }),

  isUnschedulable: computed('taints.@each.{effect,key}', function(){
    const taints = this.taints || [];

    return taints.some((taint) => UNSCHEDULABLE_KEYS.includes(taint.key) && UNSCHEDULABLE_EFFECTS.includes(taint.effect));
  }),

  isK3sNode: computed('labels', function() {
    const labels = this.labels || {};

    return Object.prototype.hasOwnProperty.call(labels, C.LABEL.NODE_INSTANCE_TYPE);
  }),

  k3sNodeArgs: computed('annotations', function() {
    const { annotations } = this;
    const nodeArgs        = annotations[C.LABEL.K3S_NODE_ARGS] ? JSON.parse(annotations[C.LABEL.K3S_NODE_ARGS]) : [];

    return nodeArgs.join(' ');
  }),

  k3sNodeEnvVar: computed('annotations', function() {
    const { annotations } = this;
    const nodeEnv         = annotations[C.LABEL.K3S_NODE_ENV] ? JSON.parse(annotations[C.LABEL.K3S_NODE_ENV]) : {};
    const nodeEnvArr      = [];

    Object.keys(nodeEnv).forEach((envKey) => {
      const out = {
        key:   envKey,
        value: nodeEnv[envKey]
      };

      nodeEnvArr.push(out)
    })

    return nodeEnvArr;
  }),

  osBlurb: computed('info.os.operatingSystem', function() {
    var out = get(this, 'info.os.operatingSystem') || '';

    out = out.replace(/\s+\(.*?\)/, ''); // Remove details in parens
    out = out.replace(/;.*$/, ''); // Or after semicolons
    // RHEL 7 uses 'Red Hat Enterprise Linux Server', RHEL 8 uses 'Red Hat Enterprise Linux'
    out = out.replace(/(Red Hat Enterprise Linux(\sServer|))/, 'RHEL'); // That's kinda long

    return out;
  }),

  engineIcon: computed('info.os.dockerVersion', function() {
    if ( (get(this, 'info.os.dockerVersion') || '').startsWith(CONTAINERD) ) {
      return 'icon-container-d';
    }

    return 'icon-docker';
  }),

  versionBlurb: computed('info.os.dockerVersion', 'isContainerD', function() {
    let version = get(this, 'info.os.dockerVersion') || '';

    if ( version.startsWith(CONTAINERD) ) {
      version = version.substr(CONTAINERD.length);

      if (!this.isContainerD) {
        next(() => set(this, 'isContainerD', true));
      }
    } else {
      if (this.isContainerD) {
        next(() => set(this, 'isContainerD', false));
      }
    }

    const idx = version.indexOf('+');

    if ( idx > 0 ) {
      version = version.substr(0, idx);
    }

    return version;
  }),

  osInfo: computed('labels', function() {
    const labels = this.labels || {};

    return labels['beta.kubernetes.io/os'];
  }),

  //  or they will not be pulled in correctly.
  displayEndpoints: computed('publicEndpoints.@each.{ipAddress,port,serviceId,instanceId}', function() {
    var store = this.clusterStore;

    return (this.publicEndpoints || []).map((endpoint) => {
      if ( !endpoint.service ) {
        endpoint.service = store.getById('service', endpoint.serviceId);
      }

      endpoint.instance = store.getById('instance', endpoint.instanceId);

      return endpoint;
    });
  }),

  // If you use this you must ensure that services and containers are already in the store
  requireAnyLabelStrings: computed(`labels.${ C.LABEL.REQUIRE_ANY }`, 'labels', function() {
    return ((this.labels || {})[C.LABEL.REQUIRE_ANY] || '')
      .split(/\s*,\s*/)
      .filter((x) => x.length > 0 && x !== C.LABEL.SYSTEM_TYPE);
  }),
  parseNodeName(nameIn) {
    const suffix = nameIn.split('.').slice(1).join('.');
    const nodesWithSameSuffix = (this.nodes || []).filter((node) => (node.nodeName || '').endsWith(suffix));

    if (nodesWithSameSuffix.length === 1) {
      return this.nodeName;
    } else if (nodesWithSameSuffix.length > 1) {
      const neu = nameIn.replace(/\..*$/, '');

      if ( neu.match(/^\d+$/) ) {
        return this.nodeName;
      } else {
        return neu;
      }
    }

    return nameIn;
  },

  actions: {
    activate() {
      return this.doAction('activate');
    },

    deactivate() {
      return this.doAction('deactivate');
    },

    cordon() {
      return this.doAction('cordon');
    },

    uncordon() {
      return this.doAction('uncordon');
    },

    scaledown() {
      return this.doAction('scaledown');
    },

    drain() {
      this.modalService.toggleModal('modal-drain-node', {
        escToClose: true,
        resources:  [this],
      });
    },

    stopDrain() {
      return this.doAction('stopDrain');
    },

    newContainer() {
      this.router.transitionTo('containers.run', { queryParams: { hostId: get(this, 'model.id') } });
    },

    edit() {
      this.modalService.toggleModal('modal-edit-host', this);
    },

    nodeConfig() {
      var url = this.linkFor('nodeConfig');

      if ( url ) {
        download(url);
      }
    }
  },

});

Node.reopenClass({ defaultSortBy: 'name,hostname', });

export default Node;
