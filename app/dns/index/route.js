import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model() {
    return this.get('store').find('stack').then((stacks) => {
      return Ember.Object.create({
        stacks: stacks,
      });
    });
  },

  setDefaultRoute: Ember.on('activate', function() {
    this.set(`session.${C.SESSION.CONTAINER_ROUTE}`,'dns');
  }),
});
