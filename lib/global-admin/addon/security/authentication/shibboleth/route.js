import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  model() {
    let gs = get(this, 'globalStore');

    return hash({
      authConfig: gs.find('authconfig', 'shibboleth', { forceReload: true }),
      principals: gs.all('principal'),
    });
  },

  resetController(controller, isExiting, transition) {
    if (isExiting && transition.targetName !== 'error') {
      controller.set('editing', false);
    }
  }
});
