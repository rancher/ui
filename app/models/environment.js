import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';
import { parseExternalId } from 'ui/utils/parse-externalid';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

export function activeIcon(env)
{
  let kind = env.get('externalIdInfo.kind');

  if ( C.EXTERNAL_ID.SYSTEM_KINDS.indexOf(kind) >= 0 )
  {
    return 'icon icon-network';
  }
  else
  {
    return 'icon icon-layers';
  }
}

var Environment = Resource.extend({
  type: 'environment',
  k8s: Ember.inject.service(),

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
      this.get('application').setProperties({
        showConfirmDeactivate : true,
        originalModel         : this,
        action                : 'deactivateServices'
      });

    },


    addService: function() {
      this.get('router').transitionTo('service.new', {
        queryParams: {
          environmentId: this.get('id'),
        },
      });
    },

    addBalancer: function() {
      this.get('router').transitionTo('service.new-balancer', {
        queryParams: {
          environmentId: this.get('id'),
        },
      });
    },

    edit: function() {
      this.get('application').setProperties({
        editEnvironment: true,
        originalModel: this,
      });
    },

    exportConfig: function() {
      var url = this.get('endpointSvc').addAuthParams(this.linkFor('composeConfig'));
      Util.download(url);
    },

    viewCode: function() {
      this.get('application').transitionToRoute('environment.code', this.get('id'));
    },

    viewGraph: function() {
      this.get('application').transitionToRoute('environment.graph', this.get('id'));
    },

    delete: function() {
      return this._super().then(() => {
        if ( this.get('application.currentRouteName') === 'environment.index' )
        {
          this.get('router').transitionTo('environments');
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
      { label: 'action.viewConfig',     icon: 'icon icon-files',          action: 'viewCode',         enabled: true },
      { label: 'action.exportConfig',   icon: 'icon icon-download',       action: 'exportConfig',     enabled: !!a.exportconfig },
      { divider: true },
      { label: 'action.remove',         icon: 'icon icon-trash',          action: 'promptDelete',     enabled: !!a.remove,                altAction: 'delete'},
      { label: 'action.viewInApi',      icon: 'icon icon-external-link',  action: 'goToApi',          enabled: true },
      { divider: true },
      { label: 'action.edit',           icon: 'icon icon-edit',           action: 'edit',             enabled: !!a.update },
    ];

    return out;
  }.property('actionLinks.{remove,purge,exportconfig,finishupgrade,cancelupgrade,rollback,cancelrollback,update}','canActivate','canDeactivate','externalIdInfo.kind'),

  combinedState: function() {
    var env = this.get('state');
    var health = this.get('healthState');
    if ( ['active','updating-active'].indexOf(env) === -1 )
    {
      // If the environment isn't active, return its state
      return env;
    }

    if ( health === 'healthy' )
    {
      return env;
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


  unremovedServices: function() {
    return UnremovedArrayProxy.create({
      sourceContent: this.get('services'),
      sortProperties: ['displayName','id']
    });
  }.property('services'),

  externalIdInfo: function() {
    let eid = this.get('externalId');
    let info = parseExternalId(eid);

    // Migrate kubernetes -> k8s
    // 1.1.x did not send minimumRancherVersion correctly, so the catalog template
    // was changed from "kubernetes" to "k8s" so that they won't upgrade from 1.2 to 1.3
    if ( info && info.kind === C.EXTERNAL_ID.KIND_SYSTEM_CATALOG )
    {
      const base = C.EXTERNAL_ID.KIND_SYSTEM_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + C.CATALOG.LIBRARY_KEY + C.EXTERNAL_ID.GROUP_SEPARATOR;
      let old_prefix = base + C.EXTERNAL_ID.KIND_LEGACY_KUBERNETES + C.EXTERNAL_ID.GROUP_SEPARATOR;
      let neu_prefix = base + C.EXTERNAL_ID.KIND_KUBERNETES + C.EXTERNAL_ID.GROUP_SEPARATOR;

      if ( eid.indexOf(old_prefix) === 0 )
      {
        let neu = eid.replace(old_prefix,neu_prefix);
        console.log('Migrating Stack ' + this.get('id') + ' from ' + eid + ' to ' + neu);
        this.set('externalId', neu);
        this.save();
        return parseExternalId(neu);
      }
    }

    return info;
  }.property('externalId'),

  grouping: function() {
    var kind = this.get('externalIdInfo.kind');

    if ( kind === C.EXTERNAL_ID.KIND_KUBERNETES || kind === C.EXTERNAL_ID.KIND_LEGACY_KUBERNETES )
    {
      return C.EXTERNAL_ID.KIND_KUBERNETES;
    }
    else if ( C.EXTERNAL_ID.SYSTEM_KINDS.indexOf(kind) >= 0 )
    {
      return C.EXTERNAL_ID.KIND_SYSTEM;
    }
    else
    {
      return C.EXTERNAL_ID.KIND_USER;
    }
  }.property('externalIdInfo.kind'),
});

Environment.reopenClass({
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

export default Environment;
