import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  model: function (params) {
    return this.get('authzStore').find('clusterRoleTemplate', null, {
      url: `clusterRoleTemplates`,
      forceReload: true,
      removeMissing: true
    });
  },
});
