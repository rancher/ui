import Ember from "ember";

export default Ember.Controller.extend({
  // GitHub auth params
  queryParams: ['error_description','state','code','isTest'],

  error: null,
  error_description: null,
  state: null,
  code: null,
  isTest: null,

  confirmDeleteResources: null,
});
