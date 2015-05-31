import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import Util from 'ui/utils/util';

var EnvironmentController = Cattle.TransitioningResourceController.extend({
  needs: ['authenticated'],

  init: function() {
    this._super();
  },

  actions: {
    activateServices: function() {
      return this.doAction('activateservices');
    },

    deactivateServices: function() {
      return this.doAction('deactivateservices');
    },

    addService: function() {
      this.transitionToRoute('service.new', {
        queryParams: {
          environmentId: this.get('id'),
        },
      });
    },

    addBalancer: function() {
      this.transitionToRoute('service.new-balancer', {
        queryParams: {
          environmentId: this.get('id'),
        },
      });
    },

    edit: function() {
      this.transitionToRoute('environment.edit', this.get('id'));
    },

    exportConfig: function() {
      var auth = this.get('controllers.authenticated');
      var url = auth.addAuthParams(this.linkFor('composeConfig'));
      Util.download(url);
    },

    viewCode: function() {
      this.transitionTo('environment.code', this.get('id'));
    },

    viewGraph: function() {
      this.transitionTo('environment.graph', this.get('id'));
    },
  },

  availableActions: function() {
    var a = this.get('actions');

    var out = [
      { label: 'Start Services', icon: 'ss-play',            action: 'activateServices',    enabled: this.get('canActivate') },
      { label: 'Stop Services', icon: 'ss-pause',            action: 'deactivateServices',  enabled: this.get('canDeactivate') },
      { label: 'View Graph',    icon: 'ss-share',            action: 'viewGraph',            enabled: true },
      { label: 'View Config',   icon: 'ss-files',            action: 'viewCode',            enabled: true },
      { label: 'Export Config', icon: 'ss-download',         action: 'exportConfig',        enabled: !!a.exportconfig },
      { divider: true },
      { label: 'Delete',        icon: 'ss-trash',            action: 'promptDelete',        enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'View in API',   icon: 'fa fa-external-link', action: 'goToApi',             enabled: true },
      { divider: true },
      { label: 'Edit',          icon: 'ss-write',            action: 'edit',                enabled: true },
    ];

    return out;
  }.property('actions.{remove,purge,exportconfig}','canActivate','canDeactivate'),

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

    return this.get('services').filterProperty('actions.activate').get('length') > 0;
  }.property('services.@each.state','actions.activateservices'),

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

    return this.get('services').filterProperty('actions.deactivate').get('length') > 0;
  }.property('services.@each.state','actions.deactivateservices'),

  state: Ember.computed.alias('model.combinedState'),
});

EnvironmentController.reopenClass({
  stateMap: {
    'requested':        {icon: 'ss-tag',            color: 'text-danger'},
    'activating':       {icon: 'ss-tag',            color: 'text-danger'},
    'active':           {icon: 'ss-globe',          color: 'text-success'},
    'removing':         {icon: 'ss-trash',          color: 'text-danger'},
    'removed':          {icon: 'ss-trash',          color: 'text-danger'},
    'degraded':         {icon: 'ss-notifications',  color: 'text-danger'},
  }
});

export default EnvironmentController;
