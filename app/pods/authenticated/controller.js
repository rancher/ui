import Ember from "ember";

export default Ember.Controller.extend({
  error: null,

  activeTab: '',
  pageName: '',
  backRoute: null,
  backPrevious: null,
  hasAside: false,

  projects: null,
  project: null,

});
