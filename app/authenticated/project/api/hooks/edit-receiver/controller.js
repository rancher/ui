import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    cancel() {
      this.send('goToPrevious');
    },
  },
});
