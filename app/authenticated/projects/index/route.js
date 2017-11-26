import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  authzStore: service('authz-store'),
  model: function () {
    return this.get('authzStore').findAll('project').then(projects => {
      return {
        projects
      };
    });
  },
});
