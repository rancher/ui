import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  router: service(),

  type:    'podSecurityPolicyTemplate',
  actions: {
    edit() {
      this.get('router').transitionTo('global-admin.security.policies.edit', this.get('id'));
    },
  },
});
