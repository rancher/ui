import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import { parseExternalId } from 'ui/utils/parse-externalid';
import C from 'ui/utils/constants';
import { download } from 'shared/utils/util';
import { hasMany, reference } from 'ember-api-store/utils/denormalize';
import StateCounts from 'ui/mixins/state-counts';

export function activeIcon(ns)
{
  if ( ns.get('system') )
  {
    return 'icon icon-gear';
  }
  else
  {
    return 'icon icon-layers';
  }
}

export function tagsToArray(str, normalize=true) {
  return (str||'').split(/\s*,\s*/)
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
  return (name||'').trim().toLowerCase();
}

export function normalizeTags(ary) {
  return (ary||[]).map(normalizeTag).filter(str => str.length > 0);
}

var Namespace = Resource.extend(StateCounts, {
  type:         'namespace',
  k8s:          service(),
  modalService: service('modal'),
  catalog:      service(),
  scope:        service(),
  router:       service(),
  globalStore:  service(),

  pods:      hasMany('id', 'pod', 'namespaceId', 'store'),
  workloads: hasMany('id', 'workload', 'namespaceId', 'store'),
  services:  hasMany('id', 'service', 'namespaceId', 'store'),
  secrets:   hasMany('id', 'namespacedSecret', 'namespaceId', 'store'),
  ingress:   hasMany('id', 'ingress', 'namespaceId', 'store'),
  volumes:   hasMany('id', 'persistentVolumeClaim', 'namespaceId', 'store'),
  project:   reference('projectId', 'project', 'globalStore'),

  init() {
    this._super(...arguments);
    // @TODO-2.0 this.defineStateCounts('services', 'serviceStates', 'serviceCountSort');
  },

  actions: {
    edit() {
      this.get('modalService').toggleModal('modal-edit-namespace', this);
    },

    exportConfig() {
      download(this.linkFor('composeConfig'));
    },

    addContainer() {
      this.get('router').transitionTo('containers.run', this.get('projectId'), {queryParams: {namespaceId: this.get('id')}});
    },

    viewCode() {
      this.get('router').transitionTo('stack.code', this.get('id'));
    },

    viewGraph() {
      this.get('router').transitionTo('stack.graph', this.get('id'));
    },

    delete() {
      return this._super().then(() => {
        if ( this.get('application.currentRouteName') === 'stack.index' )
        {
          this.get('router').transitionTo('containers');
        }
      });
    },

    move() {
      this.get('modalService').toggleModal('modal-move-namespace', this);
    },
  },

  availableActions: computed('projectId', function() {
    let out = [
      { label:   'action.move',           icon: 'icon icon-fork',           action: 'move',             enabled: true, bulkable: true},
      { label:   'action.addContainer',   icon: 'icon icon-container',      action: 'addContainer',     enabled: !!this.get('projectId') },
      { divider: true },
    ];

    return out;
  }),

  canViewConfig: computed('actionLinks.exportconfig', function() {
    return !!this.get('actionLinks.exportconfig');
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
    return (this.get('name')||'').toLowerCase() === 'default';
  }),

  isEmpty: computed('pods.length', 'workloads.length', function() {
    return (get(this, 'pods.length')||0 + get(this, 'workloads.length')||0) === 0;
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

  grouping: computed('externalIdInfo.kind','group','system', function() {
    var kind = this.get('externalIdInfo.kind');

    if ( kind === C.EXTERNAL_ID.KIND_KUBERNETES || kind === C.EXTERNAL_ID.KIND_LEGACY_KUBERNETES )
    {
      return C.EXTERNAL_ID.KIND_KUBERNETES;
    }
    else if ( this.get('system') )
    {
      return C.EXTERNAL_ID.KIND_INFRA;
    }
    else
    {
      return C.EXTERNAL_ID.KIND_USER;
    }
  }),

  normalizedTags: computed('tags.[]', function() {
    return normalizeTags(this.get('tags'));
  }),

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
    'active':             {icon: activeIcon,                  color: 'text-success'},
    'rolling-back':       {icon: 'icon icon-history',         color: 'text-info'},
    'upgraded':           {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
    'upgrading':          {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
  }
});

export default Namespace;
