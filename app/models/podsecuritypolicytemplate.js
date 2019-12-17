import { inject as service } from '@ember/service';
import Resource from '@rancher/ember-api-store/models/resource';

export default Resource.extend({
  router: service(),

  type:    'podSecurityPolicyTemplate',

  canHaveLabels: true,

  actions: {
    edit() {
      this.get('router').transitionTo('global-admin.security.policies.edit', this.get('id'));
    },
  },
});
