import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { parseExternalId } from 'ui/utils/parse-externalid';
import C from 'ui/utils/constants';
import { download } from 'ui/utils/util';
import { denormalizeIdArray } from 'ember-api-store/utils/denormalize';

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

export function tagsToArray(str) {
  return (str||'').split(/\s*,\s*/).
    map((tag) => normalizeTag(tag)).
    filter((tag) => tag.length > 0);
}

export function tagChoices(all) {
  let choices = [];
  (all||[]).forEach((stack) => {
    choices.addObjects(stack.get('tags'));
  });

  return choices;
}

var Stack = Resource.extend({
  type: 'stack',
  k8s: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),
  projectsService: Ember.inject.service('projects'),

  services: denormalizeIdArray('serviceIds'),

  actions: {
    activateServices: function() {
      return this.doAction('activateservices');
    },

    deactivateServices: function() {
      return this.doAction('deactivateservices');
    },

    cancelUpgrade: function() {
      return this.doAction('cancelupgrade');
    },

    cancelRollback: function() {
      return this.doAction('cancelrollback');
    },

    finishUpgrade: function() {
      return this.doAction('finishupgrade');
    },

    rollback: function() {
      return this.doAction('rollback');
    },

    promptStop: function() {
      this.get('modalService').toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action: 'deactivateServices'
      });
    },


    addService: function() {
      this.get('router').transitionTo('service.new', {
        queryParams: {
          stackId: this.get('id'),
        },
      });
    },

    addBalancer: function() {
      this.get('router').transitionTo('service.new-balancer', {
        queryParams: {
          stackId: this.get('id'),
        },
      });
    },

    edit: function() {
      this.get('modalService').toggleModal('edit-stack', this);
    },

    exportConfig: function() {
      download(this.linkFor('composeConfig'));
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
          this.get('router').transitionTo('stacks');
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
      { label: 'action.finishUpgrade',  icon: 'icon icon-success',        action: 'finishUpgrade',    enabled: !!a.finishupgrade },
      { label: 'action.rollback',       icon: 'icon icon-history',        action: 'rollback',         enabled: !!a.rollback },
      { label: 'action.cancelUpgrade',  icon: 'icon icon-life-ring',      action: 'cancelUpgrade',    enabled: !!a.cancelupgrade },
      { label: 'action.cancelRollback', icon: 'icon icon-life-ring',      action: 'cancelRollback',   enabled: !!a.cancelrollback },
      { label: 'action.startServices',  icon: 'icon icon-play',           action: 'activateServices', enabled: this.get('canActivate') },
      { label: 'action.stopServices',   icon: 'icon icon-stop',           action: 'promptStop',       enabled: this.get('canDeactivate'), altAction: 'deactivateServices' },
      { divider: true },
      { label: 'action.viewGraph',      icon: 'icon icon-share',          action: 'viewGraph',        enabled: true },
      { label: 'action.viewConfig',     icon: 'icon icon-files',          action: 'viewCode',         enabled: !!a.exportconfig },
      { label: 'action.exportConfig',   icon: 'icon icon-download',       action: 'exportConfig',     enabled: !!a.exportconfig },
      { divider: true },
      { label: 'action.remove',         icon: 'icon icon-trash',          action: 'promptDelete',     enabled: !!a.remove,                altAction: 'delete'},
      { label: 'action.viewInApi',      icon: 'icon icon-external-link',  action: 'goToApi',          enabled: true },
      { divider: true },
      { label: 'action.edit',           icon: 'icon icon-edit',           action: 'edit',             enabled: !!a.update },
    ];

    return out;
  }.property('actionLinks.{remove,purge,exportconfig,finishupgrade,cancelupgrade,rollback,cancelrollback,update}','canActivate','canDeactivate','externalIdInfo.kind'),

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

    if ( health === 'healthy' )
    {
      return stack;
    }
    else
    {
      return health;
    }
  }.property('state', 'healthState'),

  canActivate: function() {
    if ( !this.hasAction('activateservices') )
    {
      return false;
    }

    var count = this.get('services.length') || 0;
    if ( count === 0 )
    {
      return false;
    }

    return this.get('services').filterBy('actionLinks.activate').get('length') > 0;
  }.property('services.@each.state','actionLinks.activateservices'),

  canDeactivate: function() {
    if ( !this.hasAction('deactivateservices') )
    {
      return false;
    }

    var count = this.get('services.length') || 0;
    if ( count === 0 )
    {
      return false;
    }

    return this.get('services').filterBy('actionLinks.deactivate').get('length') > 0;
  }.property('services.@each.state','actionLinks.deactivateservices'),


  externalIdInfo: function() {
    return parseExternalId(this.get('externalId'));
  }.property('externalId'),

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

  tags: Ember.computed('group', {
    get() {
      return tagsToArray(this.get('group'));
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
      if ( !have.contains(want[i]) ) {
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
