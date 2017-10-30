import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { parseExternalId } from 'ui/utils/parse-externalid';
import C from 'ui/utils/constants';
import { download } from 'shared/utils/util';
import { denormalizeIdArray } from 'ember-api-store/utils/denormalize';
import StateCounts from 'ui/mixins/state-counts';

export function activeIcon(stack)
{
  if ( stack.get('system') )
  {
    return 'icon icon-gear';
  }
  else
  {
    return 'icon icon-layers';
  }
}

export function normalizeTag(name) {
  return (name||'').trim().toLowerCase();
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

export function tagChoices(all) {
  let choices = [];
  (all||[]).forEach((stack) => {
    choices.addObjects(stack.get('tags'));
  });

  return choices;
}

var Stack = Resource.extend(StateCounts, {

  type:            'stack',
  k8s:             Ember.inject.service(),
  modalService:    Ember.inject.service('modal'),
  catalog:         Ember.inject.service(),
  projectsService: Ember.inject.service('projects'),
  router:          Ember.inject.service(),


  services:        denormalizeIdArray('serviceIds'),
  realServices:    Ember.computed.filterBy('services','isReal',true),

  init() {
    this._super(...arguments);
    this.defineStateCounts('services', 'serviceStates', 'serviceCountSort');
  },

  _allInstances: null,
  instances: Ember.computed('_allInstances.@each.stackId', function() {
    let all = this.get('_allInstances');
    if ( !all ) {
      all = this.get('store').all('instance');
      this.set('_allInstances', all);
    }

    return all.filterBy('stackId', this.get('id'));
  }),

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

  availableActions: function() {
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
  }.property('actionLinks.{exportconfig}','links.{update,remove}','externalIdInfo.kind','canStartAll','canPauseAll','canStopAll'),

  canStartAll: function() {
    if ( !this.hasAction('startall') ) {
      return false;
    }

    var count = this.get('services.length') || 0;
    if ( count === 0 ) {
      return false;
    }

    return this.get('services').filterBy('actionLinks.activate').get('length') > 0;
  }.property('services.@each.state','actionLinks.startall'),

  canPauseAll: function() {
    if ( !this.hasAction('pauseall') ) {
      return false;
    }

    var count = this.get('services.length') || 0;
    if ( count === 0 ) {
      return false;
    }

    return this.get('services').filterBy('actionLinks.pause').get('length') > 0;
  }.property('services.@each.state','actionLinks.pauseall'),

  canStopAll: function() {
    if ( !this.hasAction('stopall') ) {
      return false;
    }

    var services = this.get('services');
    var containers = this.get('instances').filter((inst) => {
      return inst.get('serviceId') === null;
    });
    var countS = (services.length || 0);
    var countC = (containers.length || 0);

    if ( (countS + countC) === 0 ) {
      return false;
    }

    return services.filterBy('actionLinks.deactivate').get('length') > 0 && containers.filterBy('actionLinks.stop').get('length');
  }.property('services.@each.state','actionLinks.stopall'),

  canViewConfig: function() {
    return !!this.get('actionLinks.exportconfig');
  }.property('actionLinks.exportconfig'),

  combinedState: function() {
    var stack = this.get('state');
    var health = this.get('healthState');

    if ( stack === 'active' && health ) {
      return health;
    } else {
      return stack;
    }
  }.property('state', 'healthState'),

  externalIdInfo: function() {
    return parseExternalId(this.get('externalId'));
  }.property('externalId'),

  isDefault: function() {
    return (this.get('name')||'').toLowerCase() === 'default';
  }.property('name'),

  isEmpty: Ember.computed('instances.length', 'services.length', function() {

    if (Ember.isEmpty(this.get('instances')) && Ember.isEmpty(this.get('services'))) {
      return true;
    }

    return false;
  }),

  isFromCatalog: function() {
    let kind = this.get('externalIdInfo.kind');
    return kind === C.EXTERNAL_ID.KIND_CATALOG || kind === C.EXTERNAL_ID.KIND_SYSTEM_CATALOG;
  }.property('externalIdInfo.kind'),

  // This only works if the templates have already been loaded elsewhere...
  catalogTemplate: function() {
    return this.get('catalog').getTemplateFromCache(this.get('externalIdInfo.templateId'));
  }.property('externalIdInfo.templateId'),

  icon: function() {
    let tpl = this.get('catalogTemplate');
    if ( tpl ) {
      return tpl.linkFor('icon');
    }
  }.property('catalogTemplate'),

  grouping: function() {
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
  }.property('externalIdInfo.kind','group','system'),

  normalizedTags: Ember.computed('group', {
    get() {
      return tagsToArray(this.get('group'));
    },
    set(key,value) {
      this.set('group', (value||[]).map((x) => normalizeTag(x)).join(', '));
      return value;
    }
  }),
  tags: Ember.computed('group', {
    get(){
      return tagsToArray(this.get('group'), false);
    },
    set(key,value) {
      this.set('group', (value||[]).map((x) => normalizeTag(x)).join(', '));
      return value;
    }
  }),

  hasTags(want) {
    if ( !want || !want.length ) {
      return true;
    }

    let have = this.get('tags');
    for ( let i = 0 ; i < want.length ; i++ ) {
      if ( !have.includes(want[i]) ) {
        return false;
      }
    }

    return true;
  },
});

Stack.reopenClass({
  stateMap: {
    'active':             {icon: activeIcon,                  color: 'text-success'},
    'rolling-back':       {icon: 'icon icon-history',         color: 'text-info'},
    'upgraded':           {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
    'upgrading':          {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
  }
});

export default Stack;
