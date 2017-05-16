import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return Ember.RSVP.hash({
      environment: this.get('store').findAll('apikey', null, {forceReload: true}),
    });
  },
});
