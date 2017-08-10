import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { parseExternalId } from 'ui/utils/parse-externalid';
import C from 'ui/utils/constants';
import { download } from 'ui/utils/util';
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

  type: 'stack',
  k8s: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),
  projectsService: Ember.inject.service('projects'),

  services: denormalizeIdArray('serviceIds'),
  realServices: Ember.computed.filterBy('services','isReal',true),

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
    edit: function() {
      this.get('modalService').toggleModal('modal-edit-stack', this);
    },

    exportConfig: function() {
      download(this.linkFor('composeConfig'));
    },

    addContainer: function() {
      this.get('application').transitionToRoute('containers.run', {queryParams: {stackId: this.get('id')}});
    },

    viewCode: function() {
      this.get('application').transitionToRoute('stack.code', this.get('id'));
    },

    viewGraph: function() {
      this.get('application').transitionToRoute('stack.graph', this.get('id'));
    },

    delete: function() {
      return this._super().then(() => {
        if ( this.get('application.currentRouteName') === 'stack.index' )
        {
          this.get('router').transitionTo('rontainers');
        }
      });
    },
  },

  availableActions: function() {
    var a = this.get('actionLinks');

    if ( this.get('externalIdInfo.kind') === C.EXTERNAL_ID.KIND_KUBERNETES )
    {
      return [];
    }


    var out = [
      { label: 'action.addContainer',   icon: 'icon icon-container',      action: 'addContainer',     enabled: true },
      { divider: true },
      { label: 'action.edit',           icon: 'icon icon-edit',           action: 'edit',             enabled: !!a.update },
      { label: 'action.viewConfig',     icon: 'icon icon-files',          action: 'viewCode',         enabled: !!a.exportconfig },
      { label: 'action.exportConfig',   icon: 'icon icon-download',       action: 'exportConfig',     enabled: !!a.exportconfig },
//      { label: 'action.viewGraph',      icon: 'icon icon-share',          action: 'viewGraph',        enabled: true },
      { divider: true },
      { label: 'action.remove',         icon: 'icon icon-trash',          action: 'promptDelete',     enabled: !!a.remove,                altAction: 'delete'},
      { divider: true },
      { label: 'action.viewInApi',      icon: 'icon icon-external-link',  action: 'goToApi',          enabled: true },
    ];

    return out;
  }.property('actionLinks.{remove,purge,exportconfig,rollback,update}','externalIdInfo.kind'),

  canViewConfig: function() {
    return !!this.get('actionLinks.exportconfig');
  }.property('actionLinks.exportconfig'),

  combinedState: function() {
    var stack = this.get('state');
    var health = this.get('healthState');
    if ( ['active','updating-active'].indexOf(stack) === -1 )
    {
      // If the stack isn't active, return its state
      return stack;
    }

    // @TODO include individual containers
    let hasCheck = !!this.get('realServices').findBy('launchConfig.healthCheck')

    if ( hasCheck && health ) {
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
    'active':             {icon: activeIcon,          color: 'text-success'},
    'canceled-rollback':  {icon: 'icon icon-life-ring',       color: 'text-info'},
    'canceled-upgrade':   {icon: 'icon icon-life-ring',       color: 'text-info'},
    'canceling-rollback': {icon: 'icon icon-life-ring',       color: 'text-info'},
    'canceling-upgrade':  {icon: 'icon icon-life-ring',       color: 'text-info'},
    'finishing-upgrade':  {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
    'rolling-back':       {icon: 'icon icon-history',         color: 'text-info'},
    'upgraded':           {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
    'upgrading':          {icon: 'icon icon-arrow-circle-up', color: 'text-info'},
  }
});

export default Stack;
