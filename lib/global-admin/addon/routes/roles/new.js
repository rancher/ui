import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  model: function () {
    var role = this.get('authzStore').createRecord({
      type: 'projectRoleTemplate',
      name: '',
      rules: [{
        apiGroups: ['*'],
        type: 'policyRule',
        resources: [],
        verbs: [],
      }],
      projectRoleTemplateIds: [''],
    });
    return this.get('authzStore').find('projectRoleTemplate', null, { url: 'projectRoleTemplates', forceReload: true, removeMissing: true }).then((roles) => {
      return {
        role: role,
        roles: roles,
      }
    });
  },
});
