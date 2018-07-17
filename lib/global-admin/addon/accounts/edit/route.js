import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, setProperties } from '@ember/object';
import { hash } from 'rsvp';
import { schedule } from '@ember/runloop';

export default Route.extend({
  globalStore: service(),
  model(params) {
    return hash({ user: get(this, 'globalStore').find('user', params.user_id), });
  },

  afterModel() {
    schedule('afterRender', this, () => {
      var input = $('.user-display-name')[0];  // eslint-disable-line

      if (input) {
        input.focus();
      }
    });
  },
  resetController(controller/* , isExiting, transition */) {
    setProperties(controller, {
      primaryResource: null,
      password:        '',
      confirm:         '',
      errors:          [],
    });
  },

});
