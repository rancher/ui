import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get/* , set */ } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  model(params) {
    let store = get(this, 'globalStore');

    return hash({
      globalRoles: store.findAll('globalrole'),
      user:        store.find('user', params.user_id),
    });
  },
});
