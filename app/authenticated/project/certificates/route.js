import Route from '@ember/routing/route';
import { hash } from 'rsvp'
import { set } from '@ember/object';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  model() {
    const store = this.store;

    return hash({
      projectCerts:    store.findAll('certificate'),
      namespacedCerts: store.findAll('namespacedCertificate'),
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.certificates');
  }),
});
