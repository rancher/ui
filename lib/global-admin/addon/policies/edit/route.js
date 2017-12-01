import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authzStore: service('authz-store'),
  model: function (params) {
    return this.get('authzStore').find(`podSecurityPolicyTemplate`, null, { url: 'podSecurityPolicyTemplates', forceReload: true, removeMissing: true }).then((policies) => {
      const policy = policies.findBy('id', params.policy_id);
      if (!policy) {
        this.replaceWith('policies.index');
      }
      return {
        policy,
        policies,
      }
    });
  },
});
