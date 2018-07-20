import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model(params) {
    const store = get(this, 'globalStore');

    return hash({
      role:     store.find('clusterroletemplatebinding', params.role_id),
      roles:    store.find('roletemplate', null, {
        filter: {
          hidden:  false,
          context: 'cluster'
        }
      }),
      policies: store.find('podsecuritypolicytemplate'),
    });
  },
});
