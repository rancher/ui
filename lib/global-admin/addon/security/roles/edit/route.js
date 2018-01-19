import Route from '@ember/routing/route';
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
    });
  },
});
