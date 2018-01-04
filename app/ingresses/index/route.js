import { on } from '@ember/object/evented';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  model() {
    const store = this.get('store');
    return hash({
      ingresses: store.findAll('ingress'),
    });
  },

  setDefaultRoute: on('activate', function() {
    this.set(`session.${C.SESSION.CONTAINER_ROUTE}`,'ingresses');
  }),
});
