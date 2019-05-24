import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    back() {
      return this.transitionToRoute('authenticated.project.hpa.index');
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
