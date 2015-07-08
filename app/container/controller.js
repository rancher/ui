import Ember from 'ember';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';
import C from 'ui/utils/constants';

var ContainerController = Ember.Controller.extend(CattleTransitioningController, {
  needs: ['application'],
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

    shell: function() {
      this.get('controllers.application').setProperties({
        showShell: true,
        originalModel: this.get('model'),
      });
    },

    logs: function() {
      this.get('controllers.application').setProperties({
        showContainerLogs: true,
        originalModel: this.get('model'),
      });
    },

    edit: function() {
      this.get('controllers.application').setProperties({
        editContainer: true,
        originalModel: this.get('model'),
      });
    },

    clone: function() {
      // @TODO Fix this hackery for nested components...
      // http://emberjs.jsbin.com/mecesakase
      if ( Ember.Component.detectInstance(this.get('target')) )
      {
        this.set('target', window.l('router:main'));
      }

      this.get('controllers.application').transitionToRoute('containers.new', {queryParams: {containerId: this.get('model.id')}});
    },

    cloneToService: function() {
      // @TODO Fix this hackery for nested components...
      // http://emberjs.jsbin.com/mecesakase
      if ( Ember.Component.detectInstance(this.get('target')) )
      {
        this.set('target', window.l('router:main'));
      }

      this.get('controllers.application').transitionToRoute('service.new', {queryParams: {containerId: this.get('model.id')}});
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
