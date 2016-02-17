import Ember from 'ember';
import Util from 'ui/utils/util';
import Resource from 'ember-api-store/models/resource';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';
import { parseExternalId } from 'ui/utils/parse-externalid';
import C from 'ui/utils/constants';

var Environment = Resource.extend({
  type: 'environment',
  endpoint: Ember.inject.service(),

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
      var url = this.get('endpoint').addAuthParams(this.linkFor('composeConfig'));
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

    if ( this.get('externalIdInfo.kind') === C.EXTERNALID.KIND_KUBERNETES )
    {
      return [];
    }


    var out = [
      { label: 'Finish Upgrade',  icon: 'icon icon-success',          action: 'finishUpgrade',       enabled: !!a.finishupgrade },
      { label: 'Rollback',        icon: 'icon icon-history',          action: 'rollback',            enabled: !!a.rollback },
      { label: 'Cancel Upgrade',  icon: 'icon icon-life-ring',        action: 'cancelUpgrade',       enabled: !!a.cancelupgrade },
      { label: 'Cancel Rollback', icon: 'icon icon-life-ring',        action: 'cancelRollback',      enabled: !!a.cancelrollback },
      { label: 'Start Services',  icon: 'icon icon-play',             action: 'activateServices',    enabled: this.get('canActivate') },
      { label: 'Stop Services',   icon: 'icon icon-stop',             action: 'deactivateServices',  enabled: this.get('canDeactivate') },
      { divider: true },
      { label: 'View Graph',      icon: 'icon icon-share',            action: 'viewGraph',            enabled: true },
      { label: 'View Config',     icon: 'icon icon-files',            action: 'viewCode',            enabled: true },
      { label: 'Export Config',   icon: 'icon icon-download',         action: 'exportConfig',        enabled: !!a.exportconfig },
      { divider: true },
      { label: 'Delete',          icon: 'icon icon-trash',            action: 'promptDelete',        enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'View in API',     icon: 'icon icon-external-link',    action: 'goToApi',             enabled: true },
      { divider: true },
      { label: 'Edit',            icon: 'icon icon-edit',             action: 'edit',                enabled: true },
    ];

    return out;
  }.property('actionLinks.{remove,purge,exportconfig,finishupgrade,cancelupgrade,rollback,cancelrollback}','canActivate','canDeactivate','externalIdInfo.kind'),

  healthState: function() {
    // Get the state of each instance
    var services = this.get('services')||[];
    var healthy = 0;
    var unremoved = 0;
    services.forEach((service) => {
      var resource = service.get('state');
      var health = service.get('healthState');

      if ( ['removing','removed','purging','purged'].indexOf(resource) >= 0 )
      {
        return;
      }

      unremoved++;

      if ( C.ACTIVEISH_STATES.indexOf(resource) >= 0 && (health === 'healthy' || health === 'started-once') )
      {
        healthy++;
      }
    });

    if ( healthy >= unremoved )
    {
      return 'healthy';
    }
    else
    {
      return 'unhealthy';
    }
  }.property('services.@each.{state,healthState}'),

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
      return 'degraded';
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
    return parseExternalId(this.get('externalId'));
  }.property('externalId'),

  grouping: function() {
    var kind = this.get('externalIdInfo.kind');

    if ( kind === C.EXTERNALID.KIND_KUBERNETES )
    {
      return C.EXTERNALID.KIND_KUBERNETES;
    }
    else if ( C.EXTERNALID.SYSTEM_KINDS.indexOf(kind) >= 0 )
    {
      return C.EXTERNALID.KIND_SYSTEM;
    }
    else
    {
      return C.EXTERNALID.KIND_USER;
    }
  }.property('externalIdInfo.kind'),
});

Environment.reopenClass({
  stateMap: {
    'active':             {icon: 'icon icon-layers',          color: 'text-success'},
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
