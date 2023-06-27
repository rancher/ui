import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get/* , set */ } from '@ember/object';

export default Route.extend({
  session:     service(),
  scope:       service(),
  globalStore: service(),

  model(/* params, transition*/) {
    return get(this, 'globalStore').find('user', null, {
      forceReload: true,
      filter:      { me: true }
    }).then((user) => EmberObject.create({ account: get(user, 'firstObject'), /* dont like this */ }));
  },
});
