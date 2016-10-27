import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var userStore = this.get('userStore');
    return Ember.RSVP.hash({
      projects: userStore.findAll('project', null, {url: 'projects', filter: {all: 'true'}, forceReload: true}),
      projectTemplates: userStore.findAll('projecttemplate', null, {url: 'projectTemplates', forceReload: true}),
    });
  },
});
