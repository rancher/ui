import Ember from "ember";

export default Ember.Controller.extend({
  error: null,

  activeTab: '',
  pageName: '',
  backRoute: null,
  hasAside: false,

  projects: null,
  project: null,

});
