import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  scope: service(),

  redirect() {
    var project = this.get('scope.current');
    var cluster = this.get('scope.currentCluster');
    if ( project ) {
      this.get('scope').setPageScope('project');
      this.replaceWith('authenticated.project', project.get('id'));
    } else {
      this.get('scope').setPageScope('cluster');
      if (cluster) {
        this.replaceWith('authenticated.cluster', cluster.get('id'));
      } else {
        this.replaceWith('global-admin.clusters');
      }
    }
  },
});
