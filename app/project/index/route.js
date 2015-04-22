import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params , transition*/) {
    var project = this.modelFor('project');
    return project.importLink('projectMembers').then(() => {
      return project;
    });
  },

  renderTemplate: function() {
    this.render({controller: 'project'});
  },

  actions: {
    didTransition: function() {
      this._super();
      this.send('setPageLayout', {label: 'All Projects', backRoute: 'projects'});
    },
  },
});
