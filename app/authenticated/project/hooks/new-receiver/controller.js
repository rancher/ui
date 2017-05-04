import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['receiverId'],
  receiverId: null,

  actions: {
    cancel() {
      this.send('goToPrevious');
    },
  },

});
