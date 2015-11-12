import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params /* , transition*/) {
    return this.get('store').findAllUnremoved('project').then((all) => {
      return this.get('store').find('project', params.project_id).then((project) => {
        return project.importLink('projectMembers').then(() => {
          return Ember.Object.create({
            project: project,
            all: all,
          });
        });
      });
    });
  },
});
