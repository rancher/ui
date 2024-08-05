import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return hash({ tokens: this.globalStore.findAll('token'), });
  },
});
