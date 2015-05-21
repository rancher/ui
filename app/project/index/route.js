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
});
