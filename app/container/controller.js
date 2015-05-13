import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var ContainerController = Cattle.TransitioningResourceController.extend({
  mountError: null,
  relatedVolumes: null,
  ports: null,

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

    promptDelete: function() {
      // @TODO Fix this hackery for nested components...
      // http://emberjs.jsbin.com/mecesakase
      if ( Ember.Component.detectInstance(this.get('target')) )
      {
        this.set('target', window.l('router:main'));
      }

      this._super();
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

    detail: function() {
      Ember.run.next(this, function() {
        this.send('redirectTo','container');
      });
    },

    clone: function() {
      // @TODO Fix this hackery for nested components...
      // http://emberjs.jsbin.com/mecesakase
      if ( Ember.Component.detectInstance(this.get('target')) )
      {
        this.set('target', window.l('router:main'));
      }

      this.transitionToRoute('containers.new', {queryParams: {containerId: this.get('id')}});
    },
  },

  availableActions: function() {
    var a = this.get('actions');

    var choices = [
      { label: 'Restart',       icon: 'ss-refresh',   action: 'restart',      enabled: !!a.restart },
      { label: 'Start',         icon: 'ss-play',      action: 'start',        enabled: !!a.start },
      { label: 'Stop',          icon: 'ss-pause',     action: 'stop',         enabled: !!a.stop },
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: this.get('canDelete'), altAction: 'delete' },
      { label: 'Restore',       icon: 'ss-medicalcross',     action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: 'ss-tornado',          action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'Execute Shell', icon: 'fa fa-terminal',      action: 'shell',        enabled: !!a.execute },
      { label: 'View Logs',     icon: 'ss-file',             action: 'logs',         enabled: !!a.logs },
      { divider: true },
      { label: 'View in API',   icon: 'fa fa-external-link', action: 'goToApi',      enabled: true },
      { label: 'Clone',         icon: 'ss-copier',           action: 'clone',        enabled: true },
      { label: 'Edit',          icon: 'ss-write',            action: 'edit',         enabled: !!a.update },
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

  isManaged: Ember.computed.notEmpty('systemContainer'),

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
