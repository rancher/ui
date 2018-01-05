import Route from '@ember/routing/route';
import { hash } from 'rsvp'
import { get } from '@ember/object';

export default Route.extend({
  model: function() {
    const store = get(this, 'store');

    return hash({
      projectDockerCredentials: store.findAll('dockerCredential'),
      namespacedDockerCredentials: store.findAll('namespacedDockerCredential'),
    });
  },
});
