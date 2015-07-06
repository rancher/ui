import Ember from 'ember';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';
import C from 'ui/utils/constants';

var ContainerController = Ember.Controller.extend(CattleTransitioningController, {
  state: Ember.computed.alias('model.combinedState'),

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

    cloneToService: function() {
      // @TODO Fix this hackery for nested components...
      // http://emberjs.jsbin.com/mecesakase
      if ( Ember.Component.detectInstance(this.get('target')) )
      {
        this.set('target', window.l('router:main'));
      }

      this.transitionToRoute('service.new', {queryParams: {containerId: this.get('id')}});
    },
  },

  availableActions: function() {
    var a = this.get('model.actions');
    if ( !a )
    {
      return [];
    }

    var isSystem = this.get('model.systemContainer') !== null;
    var isService = Object.keys(this.get('model.labels')||{}).indexOf(C.LABEL.SERVICE_NAME) >= 0;

    var choices = [
      { label: 'Restart',       icon: 'ss-refresh',   action: 'restart',      enabled: !!a.restart },
      { label: 'Start',         icon: 'ss-play',      action: 'start',        enabled: !!a.start },
      { label: 'Stop',          icon: 'ss-pause',     action: 'stop',         enabled: !!a.stop },
      { label: 'Delete',        icon: 'ss-trash',     action: 'promptDelete', enabled: this.get('model.canDelete'), altAction: 'delete' },
      { label: 'Restore',       icon: 'ss-medicalcross',     action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: 'ss-tornado',          action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'Execute Shell', icon: 'fa fa-terminal',      action: 'shell',        enabled: !!a.execute },
      { label: 'View Logs',     icon: 'ss-file',             action: 'logs',         enabled: !!a.logs },
      { divider: true },
      { label: 'View in API',   icon: 'fa fa-external-link', action: 'goToApi',      enabled: true },
      { label: 'Clone',         icon: 'ss-copier',           action: 'clone',        enabled: !isSystem && !isService },
//      { label: 'Clone to Service', icon: 'ss-copier',           action: 'cloneToService', enabled: !isSystem && !isService },
      { label: 'Edit',          icon: 'ss-write',            action: 'edit',         enabled: !!a.update },
    ];

    return choices;
  }.property('model.actions.{restart,start,stop,restore,purge,execute,logs,update}','model.{canDelete,systemContainer,labels}'),
});

ContainerController.reopenClass({
});

export default ContainerController;
