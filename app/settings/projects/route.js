import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var userStore = this.get('userStore');
    return Ember.RSVP.hash({
      projects: userStore.find('project', null, {url: 'projects', filter: {all: 'true'}, forceReload: true, removeMissing: true}),
      projectTemplates: userStore.find('projecttemplate', null, {url: 'projectTemplates', forceReload: true, removeMissing: true}),
    }).then(() => {
      return {
        projects: userStore.all('project'),
        projectTemplates: userStore.all('projecttemplate'),
      };
    });
  },
});
