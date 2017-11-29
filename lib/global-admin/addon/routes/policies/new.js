import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  model: function () {
    var policy = this.get('authzStore').createRecord({
      type: 'podSecurityPolicyTemplate',
      name: '',
    });
    return this.get('authzStore').find('podSecurityPolicyTemplate', null, { url: 'podSecurityPolicyTemplates', forceReload: true, removeMissing: true }).then((policies) => {
      return {
        policy: policy,
        policies: policies,
      }
    });
  },
});
