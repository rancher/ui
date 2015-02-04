import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var HostController = Cattle.TransitioningResourceController.extend({
  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    delete: function() {
      return this.delete();
    },

    purge: function() {
      return this.doAction('purge');
    },

    promptDelete: function() {
      this.transitionToRoute('host.delete', this.get('id'));
    },

    newContainer: function() {
      this.transitionToRoute('containers.new', {queryParams: {hostId: this.get('id')}});
    },

    detail: function() {
      this.transitionToRoute('host', this.get('id'));
    },
  },

  availableActions: function() {
    var a = this.get('actions');

    return [
      { tooltip: 'View in API',   icon: 'fa-external-link', action: 'goToApi',      enabled: true,            detail: true },
      { tooltip: 'Activate',      icon: 'fa-arrow-up',      action: 'activate',     enabled: !!a.activate,    color: 'text-success'},
      { tooltip: 'Deactivate',    icon: 'fa-arrow-down',    action: 'deactivate',   enabled: !!a.deactivate,  color: 'text-danger'},
      { tooltip: 'Delete',        icon: 'fa-trash-o',       action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { tooltip: 'Purge',         icon: 'fa-fire',          action: 'purge',        enabled: !!a.purge, color: 'text-danger' },
    ];
  }.property('actions.{activate,deactivate,remove,purge}'),

  primaryActions: function() {
    var a = this.get('availableActions');
    var choices = [];

    choices.push({ tooltip: 'Add Container',         icon: 'fa-plus',          action: 'newContainer',        enabled: true, color: 'text-primary' });

    var primary = ifEnabled('activate') || ifEnabled('deactivate');
    if ( primary )
    {
      choices.push(primary);
    }

    if ( ifEnabled('promptDelete') )
    {
      choices.push(byName('promptDelete'));
    }

    choices.push({ tooltip: 'Details',         icon: 'fa-info',          action: 'detail',        enabled: true });
    return choices;

    function byName(name) {
      return a.filterProperty('action',name)[0];
    }

    function ifEnabled(name) {
      var action = byName(name);
      if ( action && !!action.enabled )
      {
        return action;
      }
    }
  }.property('availableActions.[]','availableActions.@each.enabled'),

  displayIp: function() {
    var obj = (this.get('ipAddresses')||[]).get('firstObject');
    if ( obj )
    {
      return obj.get('address');
    }

    return null;
  }.property('ipAddresses','ipAddresses.[]'),

  arrangedInstances: function() {
    return Ember.ArrayController.create({
      content: this.get('instances'),
      sortProperties: ['name','id']
    });
  }.property('instances.[]','instances.@each.{name,id}'),
});

HostController.reopenClass({
  stateMap: {
    'requested':        {icon: 'fa-ticket',       color: 'text-danger'},
    'registering':      {icon: 'fa-ticket',       color: 'text-danger'},
    'activating':       {icon: 'fa-ticket',       color: 'text-danger'},
    'active':           {icon: 'fa-desktop',      color: 'text-info'},
    'reconnecting':     {icon: 'fa-cog fa-spin',  color: 'text-danger'},
    'updating-active':  {icon: 'fa-desktop',      color: 'text-info'},
    'updating-inactive':{icon: 'fa-warning',      color: 'text-danger'},
    'deactivating':     {icon: 'fa-adjust',       color: 'text-danger'},
    'inactive':         {icon: 'fa-stop',         color: 'text-danger'},
    'removing':         {icon: 'fa-trash',        color: 'text-danger'},
    'removed':          {icon: 'fa-trash',        color: 'text-danger'},
    'purging':          {icon: 'fa-fire',         color: 'text-danger'},
    'purged':           {icon: 'fa-fire',         color: 'text-danger'},
    'restoring':        {icon: 'fa-trash',        color: 'text-danger'},
  }
});

export default HostController;
