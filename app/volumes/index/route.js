import { on } from '@ember/object/evented';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  model() {
    let store = this.get('store');
    return hash({
//      volumes: store.findAll('volume'),
//      volumeTemplates: store.findAll('volumetemplate'),
    });
  },

  setDefaultRoute: on('activate', function() {
    this.set(`session.${C.SESSION.CONTAINER_ROUTE}`,'volumes');
  }),
});
