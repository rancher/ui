import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  model() {
    const original = this.modelFor('gateway.detail').gateway;

    return hash({ gateway: original.clone(),  });
  },
});
