import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model() {
    let gs = get(this, 'globalStore');
    return hash({
      // TODO: WJW mocking purpose
      // azureADConfig: gs.find('authconfig', 'azuread'),
      azureADConfig: {},
      principals: gs.all('principal')
    }).catch( e =>  e);
  },

});
