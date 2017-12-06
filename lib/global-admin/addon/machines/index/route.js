import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  catalog: service(),
  settings: service(),
  globalStore: service(),

  model() {
    let store = this.get('globalStore');

    return hash({
      nodes: store.findAll('machine'),
    });
  },
});
