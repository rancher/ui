import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model() {
    let gs = get(this, 'globalStore');

    return hash({
      googleConfig: gs.find('authconfig', 'googleoauth', { forceReload: true }),
      principals:   gs.all('principal')
    }).then(({ googleConfig, principals }) => {
      return {
        googleConfig,
        originalConfig: googleConfig.clone(),
        principals,
      }
    }).catch((e) => {
      return e;
    })
  },

  setupController(controller, model) {
    setProperties(controller, {
      model,
      confirmDisable: false,
      testing:        false,
      organizations:  get(this, 'session.orgs') || [],
      errors:         null,
    });

    set(controller, 'saved', true);
  },

  resetController(controller) {
    set(controller, 'editing', false);
  }
});
