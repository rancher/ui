import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var EnvironmentController = Cattle.TransitioningResourceController.extend({
  actions: {
    activateServices: function() {
      return this.doAction('activateservices');
    },

    deactivateServices: function() {
      return this.doAction('deactivateservices');
    },
  },
  availableActions: function() {
    var a = this.get('actions');

    var out = [
      { label: 'Activate Services', icon: 'ss-arrow-up',      action: 'activateServices',   enabled: this.get('canActivate') },
      { label: 'Deactivate Services', icon: 'ss-arrow-down',  action: 'deactivateServices', enabled: this.get('canDeactivate') },
      { label: 'Export Config', icon: 'ss-download',          action: 'exportConfig',       enabled: !!a.exportconfig },
      { divider: true },
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'View in API',   icon: 'fa fa-external-link', action: 'goToApi',      enabled: true },
      { divider: true },
      { label: 'Edit',          icon: 'ss-write',            action: 'edit',         enabled: true },
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

    return this.get('services').filterProperty('state','active').get('length') !== count;
  }.property('services.@each.state','actions.activateservices'),
  activateDisabled: Ember.computed.not('canActivate'),

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

    return this.get('services').filterProperty('state','inactive').get('length') !== count;
  }.property('services.@each.state','actions.deactivateservices'),
  deactivateDisabled: Ember.computed.not('canDectivate'),
});

EnvironmentController.reopenClass({
  stateMap: {
    'requested':        {icon: 'ss-tag',            color: 'text-danger'},
    'activating':       {icon: 'ss-tag',            color: 'text-danger'},
    'active':           {icon: 'ss-globe',          color: 'text-success'},
    'removing':         {icon: 'ss-trash',          color: 'text-danger'},
    'removed':          {icon: 'ss-trash',          color: 'text-danger'},
  }
});

export default EnvironmentController;
