import { computed, get } from '@ember/object';
import { or } from '@ember/object/computed';
import Resource from 'ember-api-store/models/resource';
import { download } from 'shared/utils/util';
import C from 'ui/utils/constants';
import StateCounts from 'ui/mixins/state-counts';
import { inject as service } from "@ember/service";
import { reference } from 'ember-api-store/utils/denormalize';
import ResourceUsage from 'shared/mixins/resource-usage';

const UNSCHEDULABLE_KEYS = ['node-role.kubernetes.io/etcd','node-role.kubernetes.io/controlplane'];
const UNSCHEDULABLE_EFFECTS = ['NoExecute','NoSchedule'];

var Node = Resource.extend(StateCounts, ResourceUsage, {
  type: 'node',

  modalService: service('modal'),
  settings: service(),
  prefs: service(),
  router: service(),
  globalStore: service(),
  clusterStore: service(),
  intl: service(),

  cluster: reference('clusterId','cluster'),
  nodePool: reference('nodePoolId'),

  init() {
    this._super(...arguments);
    this.defineStateCounts('arrangedInstances', 'instanceStates', 'instanceCountSort');
  },

  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    cordon: function() {
      return this.doAction('cordon');
    },

    uncordon: function() {
      return this.doAction('uncordon');
    },

    drain: function() {
      return this.doAction('drain');
    },

    promptEvacuate: function() {
      get(this,'modalService').toggleModal('modal-host-evacuate', {
        model: [this]
      });
    },

    evacuate: function() {
      return this.doAction('evacuate');
    },

    newContainer: function() {
      get(this,'router').transitionTo('containers.run', {queryParams: {hostId: get(this,'model.id')}});
    },

    edit: function() {
      get(this,'modalService').toggleModal('modal-edit-host', this);
    },

    nodeConfig: function() {
      var url = this.linkFor('nodeConfig');
      if ( url )
      {
        download(url);
      }
    }
  },

  availableActions: computed('links.{nodeConfig}', 'actionLinks.{cordon,uncordon,drain}', function() {
    let l = get(this,'links');
    const a = get(this, 'actionLinks');

    let out = [
      { label: 'action.cordon', icon: 'icon icon-pause', action: 'cordon', enabled: !!a.cordon, bulkable: true},
      { label: 'action.uncordon', icon: 'icon icon-play', action: 'uncordon', enabled: !!a.uncordon, bulkable: true},
      { label: 'action.drain', icon: 'icon icon-snapshot', action: 'drain', enabled: !!a.drain, bulkable: true},
      { divider: true},
      { label: 'action.nodeConfig', icon: 'icon icon-download', action: 'nodeConfig', enabled: !!l.nodeConfig},
      { divider: true },
    ];

    return out;
  }),

  displayIp: or('externalIpAddress','ipAddress'),

  displayName: computed('name','nodeName','requestedHostname','id', function() {
    let name = get(this,'name');
    if ( name ) {
      return name;
    }

    name = get(this,'nodeName');
    if ( name ) {
      if ( name.match(/[a-z]/i) ) {
        name = name.replace(/\..*$/,'');
      }

      return name;
    }

    name = get(this,'requestedHostname');
    if ( name ) {
      return name;
    }

    return '('+get(this,'id')+')';
  }),

  rolesArray: computed('etcd','controlPlane','worker', function() {
    return ['etcd','controlPlane','worker'].filter(x => !!get(this,x));
  }),

  displayRoles: computed('intl.locale','rolesArray.[]', function() {
    const intl = get(this, 'intl');
    const roles = get(this, 'rolesArray');

    if ( roles.length >= 3 ) {
      return [intl.t('generic.all')];
    }

    return roles.map(role => {
      let key = `model.machine.role.${role}`;
      if ( intl.exists(key) ) {
        return intl.t(key);
      }

      return key;
    });
  }),

  sortRole: computed('rolesArray.[]', function() {
    let roles = get(this, 'rolesArray');

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
    const taints = get(this, 'taints') || [];
    return taints.some((taint) => {
      return UNSCHEDULABLE_KEYS.includes(taint.key) && UNSCHEDULABLE_EFFECTS.includes(taint.effect);
    });
  }),

  osBlurb: computed('info.os.operatingSystem', function() {
    var out = get(this,'info.os.operatingSystem')||'';

    out = out.replace(/\s+\(.*?\)/,''); // Remove details in parens
    out = out.replace(/;.*$/,''); // Or after semicolons
    out = out.replace('Red Hat Enterprise Linux Server','RHEL'); // That's kinda long

    return out;
  }),

  // If you use this you must ensure that services and containers are already in the store
  //  or they will not be pulled in correctly.
  displayEndpoints: function() {
    var store = get(this,'clusterStore');
    return (get(this,'publicEndpoints')||[]).map((endpoint) => {
      if ( !endpoint.service ) {
        endpoint.service = store.getById('service', endpoint.serviceId);
      }

      endpoint.instance = store.getById('instance', endpoint.instanceId);
      return endpoint;
    });
  }.property('publicEndpoints.@each.{ipAddress,port,serviceId,instanceId}'),

  requireAnyLabelStrings: function() {
    return  ((get(this,'labels')||{})[C.LABEL.REQUIRE_ANY]||'')
              .split(/\s*,\s*/)
              .filter((x) => x.length > 0 && x !== C.LABEL.SYSTEM_TYPE);
  }.property(`labels.${C.LABEL.REQUIRE_ANY}`),
});

Node.reopenClass({
  defaultSortBy: 'name,hostname',
});

export default Node;
