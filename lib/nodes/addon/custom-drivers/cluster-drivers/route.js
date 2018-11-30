import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),

  model() {
    return hash({ drivers: this.get('globalStore').findAll('kontainerDriver'), });
  },
});
