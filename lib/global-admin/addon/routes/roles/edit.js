import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  model: function (params) {
    return this.get('authzStore').find('projectRoleTemplate', null, { url: 'projectRoleTemplates', forceReload: true, removeMissing: true }).then((roles) => {
      const role = roles.findBy('id', params.role_id);
      if (!role) {
        this.replaceWith('roles.index');
      }
      return {
        role,
        roles,
      }
    });
  },
});
