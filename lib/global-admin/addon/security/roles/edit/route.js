import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model: function (params) {
    const store = get(this, 'globalStore');

    return hash({
      role: store.find('roleTemplate', params.role_id),
      roles: store.find('roleTemplate', null, {
        filter: {
          hidden:false
        }
      }),
      policies: store.find('podSecurityPolicyTemplate'),
    }).then((hash) => {
      return EmberObject.create({
        role: hash.role.clone(),
        roles: hash.roles,
        policies: hash.policies,
      });
    });
  },
});
