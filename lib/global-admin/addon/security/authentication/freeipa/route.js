import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  resourceType: 'freeipaconfig',
  globalStore: service(),
  model() {
    const gs = get(this, 'globalStore');

    return hash({
      freeipaConfig: gs.find('authconfig', 'freeipa'),
      principals: gs.all('principal'),
    });
  },

  setupController: function(controller, model) {
    controller.setProperties({
      model: model,
      confirmDisable: false,
      testing: false,
      organizations: this.get('session.orgs')||[],
      errors: null,
    });
  }
});
