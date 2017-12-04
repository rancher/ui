import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  authzStore: service('authz-store'),

  model() {
    const store = get(this, 'authzStore');

    var role = store.createRecord({
      type: `projectRoleTemplate`,
      name: '',
      rules: [
        {
          apiGroups: ['*'],
          type: 'policyRule',
          resources: [],
          verbs: [],
        }
      ],
    });

    return hash({
      roles: store.find('projectRoleTemplate'),
      policies: store.find('podSecurityPolicyTemplate'),
    }).then((res) => {
      res.role = role;
      return res;
    });
  },
});
