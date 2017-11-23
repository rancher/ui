import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  model: function () {
    return this.get('authzStore').find('projectRoleTemplate', null, { url: 'projectRoleTemplates', forceReload: true, removeMissing: true }).then((roles) => roles);
  },
});
