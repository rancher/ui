import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  model: function () {
    var role = this.get('authzStore').createRecord({
      type: 'roleTemplate',
      name: '',
      rules: [{
        apiGroups: ["*"],
        resources: [],
        verbs: [],
      }],
      roles: [''],
    });
    return this.get('authzStore').find('roleTemplate', null, { url: 'roleTemplates', forceReload: true, removeMissing: true }).then((roles) => {
      return {
        role: role,
        roles: roles,
      }
    });
  },
});
