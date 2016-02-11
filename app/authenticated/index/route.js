import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  redirect() {
    this.get('projects').selectDefault().then((project) => {
      if ( project ) {
        this.replaceWith('authenticated.project', project.get('id'));
      } else {
        this.replaceWith('settings.projects');
      }
    }).catch(() => {
      this.replaceWith('settings.projects');
    });
  },
});
