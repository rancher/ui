import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model() {
    const gs = get(this, 'globalStore');

    return hash({
      azureADConfig: gs.find('authconfig', 'azuread'),
      principals:    gs.all('principal')
    });
  },

});
