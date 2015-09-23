import Ember from "ember";

export default Ember.Controller.extend({
  // GitHub auth params
  queryParams: ['error_description','state','code','isTest'],

  error: null,
  error_description: null,
  state: null,
  code: null,
  isTest: null,

  // Keys that trigger modals go in here
  confirmDeleteResources: null,
  originalModel: null,

  showAbout: null,
  editAccount: null,
  editApikey: null,
  editApikeyIsNew: null,
  editProject: null,
  editContainer: null,
  editHost: null,
  editService: null,
  editAliasService: null,
  editLoadBalancerService: null,
  editRegistry: null,
  showShell: null,
  showContainerLogs: null,
});
