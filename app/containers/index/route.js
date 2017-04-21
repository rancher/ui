import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  setDefaultRoute: Ember.on('activate', function() {
    this.set(`session.${C.SESSION.CONTAINER_ROUTE}`,'containers');
  }),

  actions: {
    toggleGrouping() {
      let cur = this.get('controller.mode');
      this.set('controller.mode', (cur === 'list' ? 'grouped' : 'list'));
    },
  },

  shortcuts: {
    'g': 'toggleGrouping',
  }
});
