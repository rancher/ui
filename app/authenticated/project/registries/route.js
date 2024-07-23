import Route from '@ember/routing/route';
import { hash } from 'rsvp'
import { set } from '@ember/object';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  model() {
    const store = this.store;

    return hash({
      projectDockerCredentials:    store.findAll('dockerCredential'),
      namespacedDockerCredentials: store.findAll('namespacedDockerCredential'),
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.registries');
  }),
});
