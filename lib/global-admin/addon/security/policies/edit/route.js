import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  model: function (params) {
    return this.get('authzStore').find('podSecurityPolicyTemplate', params.policy_id).then((policy) => {
      return {
        policy,
      }
    });
  },
});
