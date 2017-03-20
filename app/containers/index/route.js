import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  setDefaultRoute: Ember.on('activate', function() {
    this.set(`session.${C.SESSION.CONTAINER_ROUTE}`,'containers');
  }),
});
