import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    done() {
      this.send('goToPrevious','authenticated.clusters');
    },

    cancel() {
      this.send('goToPrevious','authenticated.clusters');
    },
  },
});
