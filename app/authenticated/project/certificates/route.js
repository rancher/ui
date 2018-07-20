import Route from '@ember/routing/route';
import { hash } from 'rsvp'
import { get, set } from '@ember/object';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  model() {
    const store = get(this, 'store');

    return hash({
      projectCerts:    store.findAll('certificate'),
      namespacedCerts: store.findAll('namespacedCertificate'),
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.certificates');
  }),
});
