import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  queryParams: {
    type: 'project',
  },
  model: function (params) {
    var role = this.get('authzStore').createRecord({
      type: `${params.type}RoleTemplate`,
      name: '',
      rules: [{
        apiGroups: ['*'],
        type: 'policyRule',
        resources: [],
        verbs: [],
      }],
    });
    role.set(`${params.type}RoleTemplateIds`, ['']);
    return this.get('authzStore').find(`${params.type}RoleTemplate`, null, { url: `${params.type}RoleTemplates`, forceReload: true, removeMissing: true }).then((roles) => {
      return {
        role: role,
        roles: roles,
      }
    });
  },
});
