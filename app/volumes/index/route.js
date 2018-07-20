import { on } from '@ember/object/evented';
import { get, set } from '@ember/object';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  model() {
    let store = get(this, 'store');

    return hash({ persistentVolumeClaims: store.findAll('persistentVolumeClaim'), });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CONTAINER_ROUTE }`, 'volumes');
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, undefined);
  }),
});
