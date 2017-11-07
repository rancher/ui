import Controller from '@ember/controller';

export default Controller.extend({
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
