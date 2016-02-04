import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['environmentId'],
  environmentId: null,

  actions: {
    done() {
      this.send('goToPrevious');
    },

    cancel() {
      this.send('goToPrevious');
    },
  }
});
