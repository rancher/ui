import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  projects: service(),

  redirect() {
    var project = this.get('projects.current');
    if ( project ) {
      this.replaceWith('authenticated.project', project.get('id'));
    } else {
      this.replaceWith('authenticated.clusters');
    }
  },
});
