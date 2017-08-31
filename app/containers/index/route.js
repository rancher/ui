import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model() {
    var store = this.get('store');
    return Ember.RSVP.hash({
      services: store.findAll('service'),
      instances: store.findAll('instance'),
    });
  },

  setDefaultRoute: Ember.on('activate', function() {
    this.set(`session.${C.SESSION.CONTAINER_ROUTE}`,'containers');
  }),
});
