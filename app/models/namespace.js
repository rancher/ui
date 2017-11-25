import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import { parseExternalId } from 'ui/utils/parse-externalid';
import C from 'ui/utils/constants';
import { download } from 'shared/utils/util';
import { hasMany } from 'ember-api-store/utils/denormalize';
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

export function tagChoices(all) {
  let choices = [];
  (all||[]).forEach((ns) => {
    choices.addObjects(ns.get('tags'));
  });

  return choices;
}

var Namespace = Resource.extend(StateCounts, {
  type:         'namespace',
  k8s:          service(),
  modalService: service('modal'),
  catalog:      service(),
  scope:        service(),
  router:       service(),

  pods:      hasMany('pods', 'namespace', 'id', 'pod', 'namespaceId'),
  workloads: hasMany('workloads', 'namespace', 'id', 'workload', 'namespaceId'),

  init() {
    this._super(...arguments);
    // @TODO-2.0 this.defineStateCounts('services', 'serviceStates', 'serviceCountSort');
  },

  actions: {
    startAll: function() {
      return this.doAction('startall');
    },

    pauseAll: function() {
      return this.doAction('pauseall');
    },

    stopAll: function() {
      return this.doAction('stopall');
    },

    promptStop: function() {
      this.get('modalService').toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action: 'stopAll'
      });
    },

    edit: function() {
      this.get('modalService').toggleModal('modal-edit-stack', this);
    },

    exportConfig: function() {
      download(this.linkFor('composeConfig'));
    },

    addContainer: function() {
      this.get('router').transitionTo('containers.run', {queryParams: {stackId: this.get('id')}});
    },

    viewCode: function() {
      this.get('router').transitionTo('stack.code', this.get('id'));
    },

    viewGraph: function() {
      this.get('router').transitionTo('stack.graph', this.get('id'));
    },

    delete: function() {
      return this._super().then(() => {
        if ( this.get('application.currentRouteName') === 'stack.index' )
        {
          this.get('router').transitionTo('containers');
        }
      });
    },
  },

  availableActions: computed('actionLinks.{exportconfig}','links.{update,remove}','externalIdInfo.kind','canStartAll','canPauseAll','canStopAll', function() {
    let a = this.get('actionLinks');
    let l = this.get('links');

    if ( this.get('externalIdInfo.kind') === C.EXTERNAL_ID.KIND_KUBERNETES ) {
      return [];
    }

    let out    = [
      { label:   'action.addContainer',   icon: 'icon icon-container',      action: 'addContainer',     enabled: true },
      { divider: true },
      { label:   'action.pause',          icon: 'icon icon-pause',          action: 'pauseAll',         enabled: this.get('canPauseAll'), bulkable: true},
      { label:   'action.startAll',       icon: 'icon icon-play',           action: 'startAll',         enabled: this.get('canStartAll'), bulkable: true},
      { label:   'action.stopAll',        icon: 'icon icon-stop',           action: 'promptStop',       enabled: this.get('canStopAll'),  bulkable: true, altAction: 'stopAll' },
      { divider: true },
      { label:   'action.edit',           icon: 'icon icon-edit',           action: 'edit',             enabled: !!l.update },
      { label:   'action.viewConfig',     icon: 'icon icon-files',          action: 'viewCode',         enabled: !!a.exportconfig },
      { label:   'action.exportConfig',   icon: 'icon icon-download',       action: 'exportConfig',     enabled: !!a.exportconfig },
//      { label: 'action.viewGraph',      icon: 'icon icon-share',          action: 'viewGraph',        enabled: true },
      { divider: true },
      { label:   'action.remove',         icon: 'icon icon-trash',          action: 'promptDelete',     enabled: !!l.remove, bulkable: true, altAction: 'delete'},
      { divider: true },
      { label:   'action.viewInApi',      icon: 'icon icon-external-link',  action: 'goToApi',          enabled: true },
    ];

    return out;
  }),

  canStartAll: computed('services.@each.state','actionLinks.startall', function() {
    if ( !this.hasAction('startall') ) {
      return false;
    }

    var count = this.get('services.length') || 0;
    if ( count === 0 ) {
      return false;
    }

    return this.get('services').filterBy('actionLinks.activate').get('length') > 0;
  }),

  canPauseAll: computed('services.@each.state','actionLinks.pauseall', function() {
    if ( !this.hasAction('pauseall') ) {
      return false;
    }

    var count = this.get('services.length') || 0;
    if ( count === 0 ) {
      return false;
    }

    return this.get('services').filterBy('actionLinks.pause').get('length') > 0;
  }),

  canStopAll: computed('services.@each.state','actionLinks.stopall', function() {
    if ( !this.hasAction('stopall') ) {
      return false;
    }

    var services = this.get('workloads');
    var containers = this.get('pods').filterBy('workloadId', null);
    var countS = (services.length || 0);
    var countC = (containers.length || 0);

    if ( (countS + countC) === 0 ) {
      return false;
    }

    return services.filterBy('actionLinks.deactivate').get('length') > 0 && containers.filterBy('actionLinks.stop').get('length');
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
