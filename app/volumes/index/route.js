import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model() {
    let store = this.get('store');
    return Ember.RSVP.hash({
      stacks: store.findAll('stack'),
      volumes: store.findAll('volume'),
      volumeTemplates: store.findAll('volumetemplate'),
    });
  },

  setDefaultRoute: Ember.on('activate', function() {
    this.set(`session.${C.SESSION.CONTAINER_ROUTE}`,'volumes');
  }),
});
