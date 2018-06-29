import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  type:   'podSecurityPolicyTemplate',
  router: service(),

  actions: {
    edit() {

      this.get('router').transitionTo('global-admin.security.policies.edit', this.get('id'));

    },
  },
});
