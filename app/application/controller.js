import Ember from "ember";

export default Ember.Controller.extend({
  settings: Ember.inject.service(),

  // currentRouteName is set by Ember.Router
  // but getting the application controller to get it is inconvenient sometimes
  currentRouteNameChanged: function() {
    this.set('app.currentRouteName', this.get('currentRouteName'));
  }.observes('currentRouteName'),

  // GitHub auth params
  queryParams     : ['error_description','state','code','isTest', 'isPopup'],

  resourceActions : Ember.inject.service('resource-actions'),
  tooltipService  : Ember.inject.service('tooltip'),

  tooltip         : Ember.computed.alias('tooltipService.tooltipOpts.type'),

  actions: {
    clickedAction: function(actionName) {
      this.get('resourceActions').triggerAction(actionName);
    },
  },

  error             : null,
  error_description : null,
  state             : null,
  code              : null,
  isTest            : null,
  isPopup           : null,

  // Keys that trigger modals go in here
  confirmDeleteResources  : null,
  originalModel           : null,

  editAccount             : null,
  editAliasService        : null,
  editApikey              : null,
  editCertificate         : null,
  editContainer           : null,
  editExternalService     : null,
  editHost                : null,
  editLoadBalancerService : null,
  editProject             : null,
  editRegistry            : null,
  editService             : null,
  openProcessesError      : null,
  showAbout               : null,
  showAuditLogResponses   : null,
  showConfirmDeactivate   : null,
  showConsole             : null,
  showContainerLogs       : null,
  showNewDriver           : null,
  showShell               : null,
});
