import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['receiverId'],
  receiverId: null,

  actions: {
    cancel() {
      this.send('goToPrevious');
    },
  },

});
