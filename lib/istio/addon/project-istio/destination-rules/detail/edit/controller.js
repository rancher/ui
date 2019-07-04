import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    back() {
      return this.transitionToRoute('project-istio.destination-rules.index');
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
