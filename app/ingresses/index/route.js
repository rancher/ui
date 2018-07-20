import { on } from '@ember/object/evented';
import { hash } from 'rsvp';
import { set } from '@ember/object';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  model() {
    const store = this.get('store');

    return hash({
      ingresses: store.findAll('ingress'),
      services:  store.findAll('service'),
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CONTAINER_ROUTE }`, 'ingresses');
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, undefined);
  }),
});
