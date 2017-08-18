import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['clusterId'],

  actions: {
    done() {
      this.send('goToPrevious');
    },

    cancel() {
      this.send('goToPrevious');
    }
  },
});
