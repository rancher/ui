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

  showAbout               : null,
  editAccount             : null,
  editApikey              : null,
  editApikeyIsNew         : null,
  editProject             : null,
  editContainer           : null,
  editHost                : null,
  editService             : null,
  editExternalService     : null,
  editAliasService        : null,
  editLoadBalancerService : null,
  editRegistry            : null,
  showShell               : null,
  showConsole             : null,
  showContainerLogs       : null,
  openProcessesError      : null,
  showAuditLogResponses   : null,
  showConfirmDeactivate   : null,
  showNewDriver           : null,
});
