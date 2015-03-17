import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var ContainerController = Cattle.TransitioningResourceController.extend({
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

    logs: function() {
      this.send('redirectTo','container.logs');
    },

    edit: function() {
      this.send('redirectTo','container.edit');
    },

    promptDelete: function() {
      this.send('redirectTo','container.delete');
    },

    detail: function() {
      Ember.run.next(this, function() {
        this.send('redirectTo','container');
      });
    },
  },

  availableActions: function() {
    var a = this.get('actions');

    var choices = [
      { label: 'Restart',       icon: 'ss-refresh',   action: 'restart',      enabled: !!a.restart },
      { label: 'Start',         icon: 'ss-play',      action: 'start',        enabled: !!a.start },
      { label: 'Stop',          icon: 'ss-stop',      action: 'stop',         enabled: !!a.stop },
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: this.get('canDelete'), altAction: 'delete' },
      { divider: true },
      { label: 'View in API',   icon: '',             action: 'goToApi',      enabled: true,            detail: true },
      { label: 'Execute Shell', icon: '',             action: 'shell',        enabled: !!a.execute },
      { label: 'View Logs',     icon: '',             action: 'logs',         enabled: !!a.logs },
      { label: 'Restore',       icon: '',             action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: '',             action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'Edit',          icon: '',             action: 'edit',         enabled: !!a.update },
    ];

    return choices;
  }.property('actions.{update,execute,restart,start,stop,restore,purge}','canDelete'),

  isOn: function() {
    return ['running','updating-running','migrating','restarting'].indexOf(this.get('state')) >= 0;
  }.property('state'),

  displayIp: function() {
    return this.get('primaryAssociatedIpAddress') || this.get('primaryIpAddress') || '(No IP Address)';
  }.property('primaryIpAddress','primaryAssociatedIpAddress'),

  canDelete: function() {
    return ['removed','removing','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state'),

  primaryHost: Ember.computed.alias('hosts.firstObject'),
});

ContainerController.reopenClass({
  stateMap: {
   'running': {icon: 'ss-record',   color: 'text-success'},
   'stopped': {icon: 'fa fa-circle',color: 'text-danger'},
   'removed': {icon: 'ss-trash',    color: 'text-danger'},
   'purged':  {icon: 'ss-tornado',  color: 'text-danger'}
  },
});

export default ContainerController;
