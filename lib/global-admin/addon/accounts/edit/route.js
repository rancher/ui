import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, setProperties } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  model(params) {
    return hash({
      user:               get(this, 'globalStore').find('user', params.user_id),
    });
  },
  resetController(controller/* , isExiting, transition */) {
    setProperties(controller, {
      primaryResource: null,
      password:        "",
      confirm:         "",
    });
  },
});
