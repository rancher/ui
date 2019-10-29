import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  model() {
    const original = this.modelFor('virtual-service.detail').virtualService;

    return hash({ virtualService: original.clone(),  });
  },
});
