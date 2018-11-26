import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  model() {
    let gs = get(this, 'globalStore');

    return hash({
      activeDirectory: gs.find('authconfig', 'activedirectory', { forceReload: true }),
      principals:      gs.all('principal'),
    });
  },

  setupController(controller, model) {
    controller.setProperties({
      model,
      confirmDisable: false,
      testing:        false,
      organizations:  this.get('session.orgs') || [],
      errors:         null,
    });
  },

  resetController(controller, isExiting, transition) {
    if (isExiting && transition.targetName !== 'error') {
      controller.set('editing', false);
    }
  }
});
