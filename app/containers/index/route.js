import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model() {
    var store = this.get('store');
    return Ember.RSVP.hash({
      stacks: store.findAll('stack'),
      services: store.findAll('service'),
      instances: store.findAll('instance'),
      hosts: store.findAll('host'),
    });
  },

  setDefaultRoute: Ember.on('activate', function() {
    this.set(`session.${C.SESSION.CONTAINER_ROUTE}`,'containers');
  }),
});
