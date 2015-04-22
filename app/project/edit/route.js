import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    cancel: function() {
      this.goToPrevious();
    },

    didTransition: function() {
      this._super();
      this.send('setPageLayout', {label: 'Back', backPrevious: true});
    },
  },

  model: function(/*params, transition*/) {
    var project = this.modelFor('project');
    return project.followLink('projectMembers').then(function(members) {
      return {
        project: project,
        members: members,
      };
    });
  },

  setupController: function(controller, model) {
    var project = model.project;
    controller.set('originalModel', project);

    var neu = project.clone();
    var members = [];
    model.members.forEach(function(member) {
      members.push(member.clone());
    });
    neu.set('members', members);
    controller.set('model', neu);
    controller.initFields();
  },
});
