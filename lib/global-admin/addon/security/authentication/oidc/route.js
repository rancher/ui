import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model() {
    let gs = get(this, 'globalStore');

    return hash({
      oidcConfig: gs.find('authconfig', 'oidc', { forceReload: true }),
      principals: gs.all('principal')
    }).catch( (e) => {
      return e;
    });
  },

  setupController(controller, model) {
    model?.oidcConfig?.set('rancherUrl', `${ window.location.origin }/verify-auth`);

    controller.setProperties({
      model,
      confirmDisable: false,
      testing:        false,
      errors:         null,
    });

    controller.set('saved', true);
  }
});
