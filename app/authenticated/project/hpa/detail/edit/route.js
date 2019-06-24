import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  model() {
    const store = get(this, 'store');
    const original = this.modelFor('authenticated.project.hpa.detail').hpa;

    return hash({
      deployments: store.findAll('deployment'),
      hpa:         original.clone(),
    });
  },
});
