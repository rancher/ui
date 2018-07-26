import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  resourceType: 'adfsconfig',

  model() {
    const gs = get(this, 'globalStore');

    return hash({
      authConfig: gs.find('authconfig', 'adfs'),
      principals: gs.all('principal'),
    });
  },
});
