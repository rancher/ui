import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  queryParams: {
    type: 'project',
  },
  model: function (params) {
    return this.get('authzStore').find(`${params.type}RoleTemplate`, null, { url: `${params.type}RoleTemplates`, forceReload: true, removeMissing: true }).then((roles) => roles);
  },
});
