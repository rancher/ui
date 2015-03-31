import Ember from "ember";

export default Ember.Controller.extend({
  error: null,

  activeTab: '',
  pageName: '',
  backRoute: null,
  backPrevious: null,
  addRoute: null,
  hasAside: false,
  asideColor: '',

  projects: null,
  project: null,

});
