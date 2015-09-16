import Ember from 'ember';
import Util from 'ui/utils/util';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';

export default Ember.Controller.extend(CattleTransitioningController, {
  needs: ['application'],
  endpoint: Ember.inject.service(),

  actions: {
    activateServices: function() {
      return this.doAction('activateservices');
    },

    deactivateServices: function() {
      return this.doAction('deactivateservices');
    },

    addService: function() {
      this.get('controllers.application').transitionToRoute('service.new', {
        queryParams: {
          environmentId: this.get('model.id'),
        },
      });
    },

    addBalancer: function() {
      this.get('controllers.application').transitionToRoute('service.new-balancer', {
        queryParams: {
          environmentId: this.get('model.id'),
        },
      });
    },

    edit: function() {
      this.get('controllers.application').setProperties({
        editEnvironment: true,
        originalModel: this.get('model'),
      });
    },

    exportConfig: function() {
      var url = this.get('endpoint').addAuthParams(this.get('model').linkFor('composeConfig'));
      Util.download(url);
    },

    viewCode: function() {
      this.get('controllers.application').transitionToRoute('environment.code', this.get('model.id'));
    },

    viewGraph: function() {
      this.get('controllers.application').transitionToRoute('environment.graph', this.get('model.id'));
    },

    delete: function() {
      return this._super().then(() => {
        if ( this.get('controllers.application.currentRouteName') === 'environment.index' )
        {
          this.transitionToRoute('environments');
        }
      });
    },
  },

  availableActions: function() {
    var a = this.get('model.actions');

    var out = [
      { label: 'Start Services',  icon: 'icon icon-play',             action: 'activateServices',    enabled: this.get('model.canActivate') },
      { label: 'Stop Services',   icon: 'icon icon-pause',            action: 'deactivateServices',  enabled: this.get('model.canDeactivate') },
      { label: 'View Graph',      icon: 'icon icon-share',            action: 'viewGraph',            enabled: true },
      { label: 'View Config',     icon: 'icon icon-files',            action: 'viewCode',            enabled: true },
      { label: 'Export Config',   icon: 'icon icon-download',         action: 'exportConfig',        enabled: !!a.exportconfig },
      { divider: true },
      { label: 'Delete',          icon: 'icon icon-trash',            action: 'promptDelete',        enabled: !!a.remove, altAction: 'delete', color: 'text-warning' },
      { label: 'View in API',     icon: 'icon icon-externallink',     action: 'goToApi',             enabled: true },
      { divider: true },
      { label: 'Edit',            icon: 'icon icon-edit',             action: 'edit',                enabled: true },
    ];

    return out;
  }.property('model.actions.{remove,purge,exportconfig}','model.{canActivate,canDeactivate}'),

  state: Ember.computed.alias('model.combinedState'),
});
