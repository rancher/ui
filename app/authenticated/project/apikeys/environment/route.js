import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model: function() {
    return Ember.RSVP.hash({
      environment: this.get('store').findAll('apikey', null, {forceReload: true}),
    });
  },
});
