import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  authzStore: service('authz-store'),
  scope: service(),
  model: function () {
    return this.get('authzStore').findAll('project', { filter: { clusterId: this.get('scope.currentCluster.id') } }).then(projects => {
      return {
        projects
      };
    });
  },
});
