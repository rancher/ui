import { on } from '@ember/object/evented';
import { set } from '@ember/object';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  model() {
    var store = this.get('store');

    return hash({ records: store.findAll('service'), });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CONTAINER_ROUTE }`, 'authenticated.project.dns');
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, undefined);
  }),
});
