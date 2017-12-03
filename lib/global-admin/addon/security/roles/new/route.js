import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),

  model() {
    var role = this.get('authzStore').createRecord({
      type: `clusterRoleTemplate`,
      name: '',
      rules: [
        {
          apiGroups: ['*'],
          type: 'policyRule',
          resources: [],
          verbs: [],
        }
      ],
    });
    role.set(`clusterRoleTemplateIds`, ['']);

    return this.get('authzStore').find(`clusterRoleTemplate`, null, {
      url: `clusterRoleTemplates`,
      forceReload: true,
      removeMissing: true
    }).then((roles) => {
      return {
        role,
        roles
      }
    });
  },
});
