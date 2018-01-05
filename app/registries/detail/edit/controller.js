import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    done() {
      this.send('goToPrevious');
    },

    cancel() {
      this.send('goToPrevious');
    }
  },
});
