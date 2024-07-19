import Route from '@ember/routing/route';
import { hash } from 'rsvp'
import { get, set } from '@ember/object';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  model() {
    const store = this.store;

    return hash({
      projectSecrets:    store.findAll('secret'),
      namespacedSecrets: store.findAll('namespacedSecret'),
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.secrets');
  }),
});
