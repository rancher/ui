import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model(params) {
    return this.get('globalStore').find('podSecurityPolicyTemplate').then((policies) => {
      const policy = policies.findBy('id', params.policy_id);

      if (!policy) {
        this.replaceWith('security.policies.index');
      }

      return { policy, }
    });
  },
});
