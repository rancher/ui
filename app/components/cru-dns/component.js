import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import {
  get, set, setProperties, computed, observer
} from '@ember/object';
import Component from '@ember/component';
import { next } from '@ember/runloop';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import layout from './template';
import Errors from 'ui/utils/errors';
import {
  ARECORD, CNAME, ALIAS, WORKLOAD, SELECTOR
} from 'ui/models/service';
import ChildHook from 'shared/mixins/child-hook';

const LOAD_BALANCER = 'LoadBalancer';
const NODE_PORT = 'NodePort';
const EXTERNAL_NAME = 'ExternalName';
const CLUSTER_IP = 'ClusterIP';
const HEADLESS = 'Headless';
const KIND_CHOICES = [
  {
    label: 'editDns.kind.headless',
    value: HEADLESS
  },
  {
    label: 'editDns.kind.clusterIP',
    value: CLUSTER_IP
  },
  {
    label: 'editDns.kind.loadBalancer',
    value: LOAD_BALANCER
  },
  {
    label: 'editDns.kind.nodePort',
    value: NODE_PORT
  },
]

export default Component.extend(ViewNewEdit, ChildHook, {
  intl:         service(),
  capabilities: service(),

  layout,
  model: null,

  recordType:     null,
  timeoutSeconds: null,
  kindChoices:    null,

  namespace:       alias('model.namespace'),
  init() {
    this._super(...arguments);

    let type = get(this, 'model.recordType') || ARECORD;

    setProperties(this, { recordType: type, });
    if ( get(this, 'model.sessionAffinityConfig.clientIP.timeoutSeconds') ) {
      set(this, 'timeoutSeconds',  get(this, 'model.sessionAffinityConfig.clientIP.timeoutSeconds'));
    }

    this.initKindChoices();
  },

  actions: {
    setAlias(ids) {
      set(this, 'model.targetDnsRecordIds', ids);
    },

    setWorkload(ids) {
      set(this, 'model.targetWorkloadIds', ids);
    },

    setSelector(map) {
      set(this, 'model.selector', map);
    },

    setLabels(labels) {
      let out = {};

      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      set(this, 'model.labels', out);
    },
  },

  timeoutSecondsDidChange: observer('timeoutSeconds', function() {
    const timeoutSeconds = get(this, 'timeoutSeconds');

    if ( !get(this, 'model.sessionAffinityConfig.clientIP.timeoutSeconds') ) {
      set(this, 'model.sessionAffinityConfig', { clientIP: { timeoutSeconds } })
    } else {
      set(this, 'model.sessionAffinityConfig.clientIP.timeoutSeconds', timeoutSeconds)
    }
  }),

  kindDidChange: observer('kind', function() {
    let kind = get(this, 'kind');

    if ( kind === HEADLESS ) {
      kind = CLUSTER_IP;
      set(this, 'model.clusterIp', 'None');
    } else if ( this.mode === 'new' ) {
      set(this, 'model.clusterIp', '');
    }

    if ( kind === LOAD_BALANCER || kind === NODE_PORT ) {
      set(this, 'model.externalTrafficPolicy', 'Cluster');
    } else {
      set(this, 'model.externalTrafficPolicy', null);
    }

    set(this, 'model.kind', kind);
  }),

  namespaceDidChange: observer('namespace.id', function() {
    if (get(this, 'recordType') === 'workload') {
      if ( get(this, 'model.targetWorkloads').some((target) => target.namespaceId !== get(this, 'namespace.id')) ) {
        setProperties(this, {
          'model.targetWorkloadIds': null,
          recordType:                null
        })
        next(() => {
          set(this, 'recordType', 'workload');
        });
      }
    }
  }),

  recordTypeDidChange: observer('recordType', function() {
    const recordType = get(this, 'recordType');

    if ( recordType === CNAME ) {
      set(this, 'kind', EXTERNAL_NAME);
    } else {
      set(this, 'kind', HEADLESS);
    }
  }),

  showSessionAffinity: computed('isHeadless', 'showMoreOptions', function() {
    return get(this, 'showMoreOptions') && get(this, 'kind') !== HEADLESS;
  }),

  showMoreOptions: computed('recordType', 'kind', function() {
    return CNAME !==  get(this, 'recordType');
  }),

  isHeadless: computed('kind', function() {
    return get(this, 'kind') === HEADLESS;
  }),

  /*
  targetServicesAsMaps: null,
  targetIpArray: null,
  stack: null,
  stackErrors: null,
*/

  workloadsChoices: computed('namespace.id', 'workloads.[]', function() {
    const namespaceId = get(this, 'namespace.id');

    return (get(this, 'workloads') || []).filter((w) => get(w, 'namespaceId') === namespaceId);
  }),

  initKindChoices() {
    const loadBalancerCapabilites = get(this, 'capabilities.loadBalancerCapabilites');

    if ( get(this, 'model.kind') === CLUSTER_IP && get(this, 'model.clusterIp') === null ) {
      set(this, 'kind', HEADLESS);
    } else if ( get(this, 'model.kind') ) {
      set(this, 'kind', get(this, 'model.kind'));
    }

    set(this, 'kindChoices', KIND_CHOICES.map((k) => {
      let disabled = false;

      if ( !loadBalancerCapabilites.l4LoadBalancerEnabled && get(k, 'value') === 'LoadBalancer' ) {
        disabled = true
      }

      let out = {
        label: get(k, 'label'),
        value: get(k, 'value'),
        disabled
      };

      return out;
    }));
  },

  willSave() {
    get(this, 'model').clearTypesExcept(get(this, 'recordType'));

    if ( get(this, 'mode') === 'edit' && get(this, 'recordType') === WORKLOAD ) {
      delete get(this, 'model')[SELECTOR];
    }

    const ports = this.primaryResource.ports || [];

    if ( this.primaryResource.kind !== LOAD_BALANCER && this.primaryResource.kind !== NODE_PORT ) {
      ports.forEach((port) => delete port['nodePort']);
    }

    set(this, 'model.namespaceId', get(this, 'namespace.id') || '__placeholder__');
    const self = this;
    const sup = this._super;
    const errors = [];

    errors.pushObjects(get(this, 'namespaceErrors') || []);
    set(this, 'errors', errors);

    if ( get(errors, 'length') !== 0 ) {
      return false;
    }

    return this.applyHooks('_beforeSaveHooks').then(() => {
      set(this, 'model.namespaceId', get(this, 'namespace.id'));

      return sup.apply(self, ...arguments);
    }).catch((err) => {
      set(this, 'errors', [Errors.stringify(err)]);
    });
  },

  validate() {
    const errors = get(this, 'errors') || [];
    const intl = get(this, 'intl');

    const aliasTargets = (get(this, 'model.targetDnsRecords') || []);
    const aliases = aliasTargets.length;
    const aliasesToCname = aliasTargets.filterBy('recordType', CNAME).length;
    const selectorKeys = Object.keys(get(this, 'model.selector') || {}).length;
    const workloads = (get(this, 'model.targetWorkloads') || []).length;

    switch ( get(this, 'recordType') ) {
    case ARECORD:
      if ( !(get(this, 'model.ipAddresses') || []).any((ip) => ip) ) {
        errors.pushObject(intl.t('editDns.errors.targetRequired'));
      }
      break;

    case CNAME:
      if ( !get(this, 'model.hostname') ) {
        errors.pushObject(intl.t('editDns.errors.targetRequired'));
      }
      break;

    case ALIAS:
      if ( aliases < 1 ) {
        errors.pushObject(intl.t('editDns.errors.targetRequired'));
      }

      if ( aliasesToCname > 1 ) {
        errors.pushObject(intl.t('editDns.errors.multipleCname'));
      }

      if ( aliasesToCname >= 1 && aliases > aliasesToCname ) {
        errors.pushObject(intl.t('editDns.errors.mixedAlias'));
      }
      break;

    case WORKLOAD:
      if ( workloads < 1 ) {
        errors.pushObject(intl.t('editDns.errors.targetRequired'));
      }
      break;

    case SELECTOR:
      if ( selectorKeys < 1 ) {
        errors.pushObject(intl.t('editDns.errors.selectorRequired'));
      }
      break;
    }

    set(this, 'errors', errors);

    return errors.length === 0;
  },
});
