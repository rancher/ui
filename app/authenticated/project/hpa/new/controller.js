import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['id'],

  actions: {
    done() {
      return this.transitionToRoute('authenticated.project.hpa.index');
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
