import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model() {
    let gs = get(this, 'globalStore');

    return hash({
      googleConfig: gs.find('authconfig', 'googleoauth', { forceReload: true }),
      principals:   gs.all('principal')
    }).catch((e) => {
      return e;
    })
  },

  setupController(controller, model) {
    controller.setProperties({
      model,
      confirmDisable: false,
      testing:        false,
      organizations:  get(this, 'session.orgs') || [],
      errors:         null,
    });

    controller.set('saved', true);
  }
});
