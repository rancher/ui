import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var ContainerController = Cattle.TransitioningResourceController.extend({
  needs: ['hosts'],
  icon: 'fa-tint',

  actions: {
    restart: function() {
      return this.doAction('restart');
    },

    start: function() {
      return this.doAction('start');
    },

    stop: function() {
      return this.doAction('stop');
    },

    delete: function() {
      return this.delete();
    },

    restore: function() {
      return this.doAction('restore');
    },

    purge: function() {
      return this.doAction('purge');
    },

    redirectTo: function(name) {
      // @TODO Fix this hackery for nested components...
      // http://emberjs.jsbin.com/mecesakase
      if ( Ember.Component.detectInstance(this.get('target')) )
      {
        this.set('target', window.l('router:main'));
      }

      this.transitionToRoute(name, this.get('id'));
    },

    shell: function() {
      this.send('redirectTo','container.shell');
    },

    edit: function() {
      this.send('redirectTo','container.edit');
    },

    promptDelete: function() {
      this.send('redirectTo','container.delete');
    },
  },

  availableActions: function() {
    var a = this.get('actions');

    return [
      { tooltip: 'Edit',          icon: 'fa-edit',          action: 'edit',         enabled: !!a.update },
      { tooltip: 'View in API',   icon: 'fa-external-link', action: 'goToApi',      enabled: true,            detail: true },
      { tooltip: 'Execute Shell', icon: 'fa-terminal',      action: 'shell',        enabled: !!a.execute },
      { tooltip: 'Restart',       icon: 'fa-refresh',       action: 'restart',      enabled: !!a.restart },
      { tooltip: 'Start',         icon: 'fa-arrow-up',      action: 'start',        enabled: !!a.start },
      { tooltip: 'Stop',          icon: 'fa-arrow-down',    action: 'stop',         enabled: !!a.stop },
      { tooltip: 'Restore',       icon: 'fa-ambulance',     action: 'restore',      enabled: !!a.restore },
      { tooltip: 'Delete',        icon: 'fa-trash-o',       action: 'promptDelete', enabled: this.get('canDelete'), altAction: 'delete' },
      { tooltip: 'Purge',         icon: 'fa-fire',          action: 'purge',        enabled: !!a.purge },
    ];
  }.property('actions.{update,execute,restart,start,stop,restore,purge}','canDelete'),

  isOn: function() {
    return ['running','updating-running','migrating','restarting'].indexOf(this.get('state')) >= 0;
  }.property('state'),

  displayIp: function() {
    return this.get('primaryAssociatedIpAddress') || this.get('primaryIpAddress');
  }.property('primaryIpAddress','primaryAssociatedIpAddress'),

  canDelete: function() {
    return ['removed','removing','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state')
});

ContainerController.reopenClass({
  stateMap: {
   'running': {icon: 'fa-circle-o', color: 'text-info'},
   'stopped': {icon: 'fa-circle',   color: 'text-danger'},
   'removed': {icon: 'fa-trash',    color: 'text-danger'},
   'purged':  {icon: 'fa-fire',     color: 'text-danger'}
  },
});

export default ContainerController;
