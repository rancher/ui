import Ember from 'ember';

export default Ember.Service.extend({
  isReady() {
    return Ember.RSVP.resolve(true);
  },
});
