import Ember from 'ember';

export default Ember.Route.extend({
  catalogService: Ember.inject.service('catalog-service'),
  allServices: Ember.inject.service(),

  queryParams: {
    editing: {
      refreshModel: true
    }
  },

  model: function(params /* , transition*/) {
    var userStore = this.get('userStore');
    return userStore.findAllUnremoved('project').then((all) => {
      return userStore.find('project', params.project_id).then((project) => {
        return Ember.RSVP.hash({
          importProject: project.importLink('projectMembers'),
          templates: this.get('catalogService').fetchSystemTemplates(),
          stacks: this.get('catalogService').fetchSystemStacks(params.project_id),
          serviceChoices: this.get('allServices').choices(),
        }).then((hash) => {
          let out = Ember.Object.create({
            all: all,
            templates: hash.templates,
            stacks: hash.stacks,
            serviceChoices: hash.serviceChoices
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
