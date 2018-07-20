import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    done() {
      return this.transitionToRoute('volumes.index');
    },

    cancel() {
      this.send('goToPrevious', 'volumes.index');
    },
  },
});
