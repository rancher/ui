import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  projects: service(),

  model: function() {
    return this.get('userStore').find('host', null, {filter: {clusterId: this.get('projects.currentCluster.id')}}).then((hosts) => {
      return {
        hosts: hosts,
      };
    });
  },
});
