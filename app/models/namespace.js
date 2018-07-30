import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import { parseExternalId } from 'ui/utils/parse-externalid';
import C from 'ui/utils/constants';
import { hasMany, reference } from 'ember-api-store/utils/denormalize';
import StateCounts from 'ui/mixins/state-counts';

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
  modalService: service('modal'),
  catalog:      service(),
  scope:        service(),
  router:       service(),
  projectStore: service('store'),
  globalStore:  service(),
  clusterStore: service(),

  pods:                  hasMany('id', 'pod', 'namespaceId', 'projectStore', null, 'clusterStore'),
  configMaps:            hasMany('id', 'configMap', 'namespaceId', 'projectStore', null, 'clusterStore'),
  workloads:             hasMany('id', 'workload', 'namespaceId', 'projectStore', null, 'clusterStore'),
  services:              hasMany('id', 'service', 'namespaceId', 'projectStore', null, 'clusterStore'),
  dnsRecords:            hasMany('id', 'service', 'namespaceId', 'projectStore', null, 'clusterStore'),
  secrets:               hasMany('id', 'namespacedSecret', 'namespaceId', 'projectStore', null, 'clusterStore'),
  ingress:               hasMany('id', 'ingress', 'namespaceId', 'projectStore', null, 'clusterStore'),
  volumes:               hasMany('id', 'persistentVolumeClaim', 'namespaceId', 'projectStore', null, 'clusterStore'),
  type:                  'namespace',
  project:               reference('projectId', 'project', 'globalStore'),
  resourceQuotaTemplate: reference('resourceQuotaTemplateId', 'resourceQuotaTemplate', 'globalStore'),

  init() {
    this._super(...arguments);
    // @TODO-2.0 this.defineStateCounts('services', 'serviceStates', 'serviceCountSort');
  },

  availableActions: computed('projectId', () => {
    let out = [
      {
        label:    'action.move',
        icon:     'icon icon-fork',
        action:   'move',
        enabled:  true,
        bulkable: true
      },
      { divider: true },
    ];

    return out;
  }),

  combinedState: computed('state', 'healthState', function() {
    var stack = this.get('state');
    var health = this.get('healthState');

    if ( stack === 'active' && health ) {
      return health;
    } else {
      return stack;
    }
  }),

  externalIdInfo: computed('externalId', function() {
    return parseExternalId(this.get('externalId'));
  }),

  isDefault: computed('name', function() {
    return (this.get('name') || '').toLowerCase() === 'default';
  }),

  isEmpty: computed('pods.length', 'workloads.length', function() {
    return (get(this, 'pods.length') || 0 + get(this, 'workloads.length') || 0) === 0;
  }),

  hasProject: computed('project', function() {
    return !!get(this, 'project');
  }),

  isFromCatalog: computed('externalIdInfo.kind', function() {
    let kind = this.get('externalIdInfo.kind');

    return kind === C.EXTERNAL_ID.KIND_CATALOG || kind === C.EXTERNAL_ID.KIND_SYSTEM_CATALOG;
  }),

  // This only works if the templates have already been loaded elsewhere...
  catalogTemplate: computed('externalIdInfo.templateId', function() {
    return this.get('catalog').getTemplateFromCache(this.get('externalIdInfo.templateId'));
  }),

  icon: computed('catalogTemplate', function() {
    let tpl = this.get('catalogTemplate');

    if ( tpl ) {
      return tpl.linkFor('icon');
    }
  }),

  grouping: computed('externalIdInfo.kind', 'group', 'system', function() {
    var kind = this.get('externalIdInfo.kind');

    if ( kind === C.EXTERNAL_ID.KIND_KUBERNETES || kind === C.EXTERNAL_ID.KIND_LEGACY_KUBERNETES ) {
      return C.EXTERNAL_ID.KIND_KUBERNETES;
    } else if ( this.get('system') ) {
      return C.EXTERNAL_ID.KIND_INFRA;
    } else {
      return C.EXTERNAL_ID.KIND_USER;
    }
  }),

  normalizedTags: computed('tags.[]', function() {
    return normalizeTags(this.get('tags'));
  }),

  actions: {
    edit() {
      this.get('modalService').toggleModal('modal-edit-namespace', this);
    },

    delete() {
      return this._super().then(() => {
        if ( this.get('application.currentRouteName') === 'stack.index' ) {
          this.get('router').transitionTo('containers');
        }
      });
    },

    move() {
      this.get('modalService').toggleModal('modal-move-namespace', this);
    },
  },

  hasTags(want) {
    if ( !want || !want.length ) {
      return true;
    }

    want = normalizeTags(want);

    let have = this.get('normalizedTags');

    for ( let i = 0 ; i < want.length ; i++ ) {
      if ( !have.includes(want[i]) ) {
        return false;
      }
    }

    return true;
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
