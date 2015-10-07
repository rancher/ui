import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var DnsServiceController = Cattle.LegacyTransitioningResourceController.extend({
  needs: ['environment'],
  environment: Ember.computed.alias('controllers.environment'),

  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    edit: function() {
      this.transitionToRoute('service.edit', this.get('environmentId'), this.get('id'));
    },
  },

  scaleTimer: null,
  saveScale: function() {
    if ( this.get('scaleTimer') )
    {
      Ember.run.cancel(this.get('scaleTimer'));
    }

    var timer = Ember.run.later(this, function() {
      this.save();
    }, 500);

    this.set('scaleTimer', timer);
  },

  availableActions: function() {
    var a = this.get('actionLinks');

    var choices = [
      { label: 'Start',         icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate,    color: 'text-success'},
      { label: 'Stop',          icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate,  color: 'text-danger'},
      { label: 'Delete',        icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'Purge',         icon: '',                       action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'View in API',   icon: 'icon icon-externallink', action: 'goToApi',      enabled: true },
      { label: 'Clone',         icon: 'icon icon-copy',         action: 'clone',        enabled: true },
      { label: 'Edit',          icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update },
    ];

    return choices;
  }.property('actionLinks.{activate,deactivate,update,remove,purge}'),

  state: Ember.computed.alias('model.combinedState'),
});

DnsServiceController.reopenClass({
  stateMap: {
    'registering':      {icon: 'icon icon-tag',            color: 'text-danger'},
    'active':           {icon: 'icon icon-compass',        color: 'text-success'},
  }
});

export default DnsServiceController;
