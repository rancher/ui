import Ember from 'ember';

export default Ember.Controller.extend({
  application:         Ember.inject.controller(),
  actions: {
    cancel(prev) {
      this.send('goToPrevious',prev);
    }
  }
});
