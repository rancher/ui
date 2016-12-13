import Ember from 'ember';

export default Ember.Route.extend({
  allServices: Ember.inject.service(),

  queryParams: {
    editing: {
      refreshModel: true
    }
  },

  model: function(params /* , transition*/) {
    var userStore = this.get('userStore');
    return userStore.findAll('project').then((all) => {
      return userStore.find('project', params.project_id).then((project) => {
        return Ember.RSVP.hash({
          importProject: project.importLink('projectMembers'),
        }).then((/*hash*/) => {
          let out = Ember.Object.create({
            all: all,
          });

          if ( params.editing )
          {
            out.setProperties({
              originalProject: project,
              project: project.clone(),
            });
          }
          else
          {
            out.setProperties({
              originalProject: null,
              project: project,
            });
          }

          return out;
        });
      });
    });
  },
});
