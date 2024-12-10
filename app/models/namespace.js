import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import { parseExternalId } from 'ui/utils/parse-externalid';
import { convertToMillis } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit';
import C from 'ui/utils/constants';
import { hasMany, reference } from 'ember-api-store/utils/denormalize';
import StateCounts from 'ui/mixins/state-counts';
const ISTIO_INJECTION = 'istio-injection'
const ENABLED = 'enabled';

export function convertResourceQuota(key, value) {
  let out;

  switch (key) {
  case 'limitsCpu':
  case 'requestsCpu':
    out = convertToMillis(value);
    break;
  case 'limitsMemory':
  case 'requestsMemory':
    out = parseSi(value, 1024) / 1048576;
    break;
  case 'requestsStorage':
    out = parseSi(value) / (1024 ** 3);
    break;
  default:
    out = parseInt(value, 10);
  }

  return out;
}

export function activeIcon(ns) {
  if ( ns.get('system') ) {
    return 'icon icon-gear';
  } else {
    return 'icon icon-layers';
  }
}

export function tagsToArray(str, normalize = true) {
  return (str || '').split(/\s*,\s*/)
    .map((tag) => {
      if (normalize) {
        return normalizeTag(tag);
      } else {
        return tag;
      }
    })
    .filter((tag) => tag.length > 0);
}

export function normalizeTag(name) {
  return (name || '').trim().toLowerCase();
}

export function normalizeTags(ary) {
  return (ary || []).map(normalizeTag).filter((str) => str.length > 0);
}

var Namespace = Resource.extend(StateCounts, {
  k8s:          service(),
  intl:         service(),
  modalService: service('modal'),
  catalog:      service(),
  scope:        service(),
  router:       service(),
  projectStore: service('store'),
  globalStore:  service(),
  clusterStore: service(),
  growl:        service(),

  pods:                  hasMany('id', 'pod', 'namespaceId', 'projectStore', null, 'clusterStore'),
  configMaps:            hasMany('id', 'configMap', 'namespaceId', 'projectStore', null, 'clusterStore'),
  workloads:             hasMany('id', 'workload', 'namespaceId', 'projectStore', null, 'clusterStore'),
  services:              hasMany('id', 'service', 'namespaceId', 'projectStore', null, 'clusterStore'),
  secrets:               hasMany('id', 'namespacedSecret', 'namespaceId', 'projectStore', null, 'clusterStore'),
  ingress:               hasMany('id', 'ingress', 'namespaceId', 'projectStore', null, 'clusterStore'),
  volumes:               hasMany('id', 'persistentVolumeClaim', 'namespaceId', 'projectStore', null, 'clusterStore'),
  type:                  'namespace',
  project:               reference('projectId', 'project', 'globalStore'),

  init() {
    this._super(...arguments);
    // @TODO-2.0 this.defineStateCounts('services', 'serviceStates', 'serviceCountSort');
  },

  availableActions: computed('projectId', 'actionLinks.@each.move', 'scope.currentCluster.istioEnabled', 'scope.currentCluster.systemProject', 'autoInjectionEnabled', function() {
    let aa = this.actionLinks || {};

    let out = [
      {
        label:    'action.move',
        icon:     'icon icon-fork',
        action:   'move',
        enabled:  !!aa.move,
        bulkable: true
      },
      {
        label:    'action.enableAutoInject',
        icon:     'icon icon-plus-circle',
        action:   'enableAutoInject',
        enabled:  get(this, 'scope.currentCluster.istioEnabled') && !!get(this, 'scope.currentCluster.systemProject') && !this.autoInjectionEnabled,
        bulkable: true
      },
      {
        label:    'action.disableAutoInject',
        icon:     'icon icon-minus-circle',
        action:   'disableAutoInject',
        enabled:  get(this, 'scope.currentCluster.istioEnabled') && !!get(this, 'scope.currentCluster.systemProject') && this.autoInjectionEnabled,
        bulkable: true
      },
      { divider: true },
    ];

    return out;
  }),

  combinedState: computed('state', 'healthState', function() {
    var stack = this.state;
    var health = this.healthState;

    if ( stack === 'active' && health ) {
      return health;
    } else {
      return stack;
    }
  }),

  externalIdInfo: computed('externalId', function() {
    return parseExternalId(this.externalId);
  }),

  isDefault: computed('name', function() {
    return (this.name || '').toLowerCase() === 'default';
  }),

  isEmpty: computed('pods.length', 'workloads.length', function() {
    return (get(this, 'pods.length') || 0 + get(this, 'workloads.length') || 0) === 0;
  }),

  hasProject: computed('project', function() {
    return !!this.project;
  }),

  isFromCatalog: computed('externalIdInfo.kind', function() {
    let kind = this.get('externalIdInfo.kind');

    return kind === C.EXTERNAL_ID.KIND_CATALOG || kind === C.EXTERNAL_ID.KIND_SYSTEM_CATALOG;
  }),

  // This only works if the templates have already been loaded elsewhere...
  catalogTemplate: computed('externalIdInfo.templateId', function() {
    return this.catalog.getTemplateFromCache(this.get('externalIdInfo.templateId'));
  }),

  icon: computed('catalogTemplate', function() {
    let tpl = this.catalogTemplate;

    if ( tpl ) {
      return tpl.linkFor('icon');
    }

    return '';
  }),

  grouping: computed('externalIdInfo.kind', 'group', 'system', function() {
    var kind = this.get('externalIdInfo.kind');

    if ( kind === C.EXTERNAL_ID.KIND_KUBERNETES || kind === C.EXTERNAL_ID.KIND_LEGACY_KUBERNETES ) {
      return C.EXTERNAL_ID.KIND_KUBERNETES;
    } else if ( this.system ) {
      return C.EXTERNAL_ID.KIND_INFRA;
    } else {
      return C.EXTERNAL_ID.KIND_USER;
    }
  }),

  normalizedTags: computed('tags.[]', function() {
    return normalizeTags(this.tags);
  }),

  autoInjectionEnabled: computed('labels', function() {
    const labels = this.labels

    return labels && labels[ISTIO_INJECTION] === ENABLED;
  }),

  validateResourceQuota(originLimit) {
    const intl = this.intl;
    let errors = [];

    const resourceQuota = get(this, 'resourceQuota.limit') || {};
    const total = get(this, 'project.resourceQuota.limit');
    const used = get(this, 'project.resourceQuota.usedLimit') || {};

    if ( total ) {
      Object.keys(resourceQuota).forEach((key) => {
        if ( !resourceQuota[key] && parseInt(resourceQuota[key], 10) !== 0 ) {
          errors.push(intl.t('formResourceQuota.errors.limitRequired', { resource: intl.t(`formResourceQuota.resources.${ key }`) }));
        }

        if ( resourceQuota[key] ) {
          const t = convertResourceQuota(key, total[key]);
          const u = convertResourceQuota(key, used[key] || 0);
          const v = convertResourceQuota(key, resourceQuota[key]);
          const originValue = originLimit && originLimit[key] ? originLimit[key] : 0;
          const o = convertResourceQuota(key, originValue);

          const left = t - u + o;

          if ( v > left ) {
            errors.push(intl.t('formResourceQuota.errors.invalidLimit', {
              resource: intl.t(`formResourceQuota.resources.${ key }`),
              left,
              total:    t,
              used:     u - o,
            }));
          }
        }
      });
    }

    return errors;
  },

  actions: {
    edit() {
      this.modalService.toggleModal('modal-edit-namespace', this);
    },

    delete() {
      return this._super().then(() => {
        if ( this.get('application.currentRouteName') === 'stack.index' ) {
          this.router.transitionTo('containers');
        }
      });
    },

    move() {
      this.modalService.toggleModal('modal-move-namespace', this);
    },

    enableAutoInject() {
      this.autoInjectToggle()
    },

    disableAutoInject() {
      this.autoInjectToggle()
    },
  },

  hasTags(want) {
    if ( !want || !want.length ) {
      return true;
    }

    want = normalizeTags(want);

    let have = this.normalizedTags;

    for ( let i = 0 ; i < want.length ; i++ ) {
      if ( !have.includes(want[i]) ) {
        return false;
      }
    }

    return true;
  },

  autoInjectToggle() {
    const labels = this.labels
    const clone = this.clone()

    if (this.autoInjectionEnabled) {
      delete labels['istio-injection']
    } else {
      labels[ISTIO_INJECTION] = ENABLED;
    }
    set(clone, 'labels', labels)
    clone.save().catch((err) => this.growl.fromError('Error:', err))
  },
});

Namespace.reopenClass({
  stateMap: {
    'active':             {
      icon:  activeIcon,
      color: 'text-success'
    },
    'rolling-back':       {
      icon:  'icon icon-history',
      color: 'text-info'
    },
    'upgraded':           {
      icon:  'icon icon-arrow-circle-up',
      color: 'text-info'
    },
    'upgrading':          {
      icon:  'icon icon-arrow-circle-up',
      color: 'text-info'
    },
  }
});

export default Namespace;
