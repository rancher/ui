import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  model() {
    const original = this.modelFor('destination-rule.detail').destinationRule;

    return hash({ destinationRule: original.clone(),  });
  },
});
