import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  redirect() {
    var project = this.get('projects.current');
    if ( project ) {
      this.replaceWith('authenticated.project', project.get('id'));
    } else {
      this.replaceWith('settings.projects');
    }
  },
});
