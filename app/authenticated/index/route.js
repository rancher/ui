import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  scope: service(),

  redirect() {
    var project = this.get('scope.currentProject');
    var cluster = this.get('scope.currentCluster');
    if ( project ) {
      this.replaceWith('authenticated.project', project.get('id'));
    } else {
      if (cluster) {
        this.replaceWith('authenticated.cluster', cluster.get('id'));
      } else {
        this.replaceWith('global-admin.clusters');
      }
    }
  },
});
