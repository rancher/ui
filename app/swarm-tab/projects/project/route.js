import Ember from 'ember';

export default Ember.Route.extend({
  model(params/*, transition */) {
    var store = this.get('store');
    return Ember.RSVP.hash({
      services: store.find('composeservice'),
      projects: store.findAll('composeproject'),
    }).then((hash) => {
      return store.find('composeproject', params.compose_project_id).then((project) => {
        return Ember.Object.create({
          services: hash.services,
          projects: hash.projects,
          project: project
        });
      });
    });
  }
});
