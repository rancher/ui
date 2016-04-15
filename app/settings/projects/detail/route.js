import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    editing: {
      refreshModel: true
    }
  },

  model: function(params /* , transition*/) {
    var userStore = this.get('userStore');
    return userStore.findAllUnremoved('project').then((all) => {
      return userStore.find('project', params.project_id).then((project) => {
        return project.importLink('projectMembers').then(() => {
          if ( params.editing )
          {
            return Ember.Object.create({
              originalProject: project,
              project: project.clone(),
              all: all,
            });
          }
          else
          {
            return Ember.Object.create({
              originalProject: null,
              project: project,
              all: all,
            });
          }
        });
      });
    });
  },
});
