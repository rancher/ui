import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  queryParams: {
    type: 'project',
  },
  model: function (params) {
    return this.get('authzStore').find(`${params.type}RoleTemplate`, null, { url: `${params.type}RoleTemplates`, forceReload: true, removeMissing: true }).then((roles) => {
      const role = roles.findBy('id', params.role_id);
      if (!role) {
        this.replaceWith('roles.index', { queryParams: { type: 'project' } });
      }
      return {
        role,
        roles,
      }
    });
  },
});
