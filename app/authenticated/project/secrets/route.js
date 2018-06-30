import Route from '@ember/routing/route';
import { hash } from 'rsvp'
import { get, set } from '@ember/object';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  setDefaultRoute: on('activate', function() {

    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.secrets');

  }),
  model() {

    const store = get(this, 'store');

    return hash({
      projectSecrets:    store.findAll('secret'),
      namespacedSecrets: store.findAll('namespacedSecret'),
    });

  },

});
