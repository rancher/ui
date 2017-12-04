import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  model: function (params) {
    return this.get('authzStore').find('podSecurityPolicyTemplate').then((policies) => {
      const policy = policies.findBy('id', params.policy_id);
      if (!policy) {
        this.replaceWith('global-admin.security.policies.index');
      }
      return {
        policy,
        policies,
      }
    });
  },
});
