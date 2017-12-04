import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  authzStore: service('authz-store'),

  model: function (params) {
    const store = get(this, 'authzStore');

    return hash({
      role: store.find('projectRoleTemplate', params.role_id),
      roles: store.find('projectRoleTemplate'),
      policies: store.find('podSecurityPolicyTemplate'),
    });
  },
});
