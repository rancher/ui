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
      { label: 'Restart',       icon: 'icon icon-refresh',      action: 'restart',      enabled: !!a.restart },
      { label: 'Start',         icon: 'icon icon-play',         action: 'start',        enabled: !!a.start },
      { label: 'Stop',          icon: 'icon icon-pause',        action: 'stop',         enabled: !!a.stop },
      { label: 'Delete',        icon: 'icon icon-trash',        action: 'promptDelete', enabled: this.get('model.canDelete'), altAction: 'delete' },
      { label: 'Restore',       icon: '',                       action: 'restore',      enabled: !!a.restore },
      { label: 'Purge',         icon: '',                       action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'Execute Shell', icon: '',                       action: 'shell',        enabled: !!a.execute },
      { label: 'View Logs',     icon: '',                       action: 'logs',         enabled: !!a.logs },
      { label: 'View in API',   icon: 'icon icon-externallink', action: 'goToApi',      enabled: true },
      { divider: true },
      { label: 'Clone',         icon: 'icon icon-copy',         action: 'clone',        enabled: !isSystem && !isService },
      { label: 'Edit',          icon: 'icon icon-edit',         action: 'edit',         enabled: !!a.update },
    ];

    return choices;
  }.property('model.actions.{restart,start,stop,restore,purge,execute,logs,update}','model.{canDelete,systemContainer,labels}'),
});

ContainerController.reopenClass({
});

export default ContainerController;
