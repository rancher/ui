import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    back() {
      return this.transitionToRoute('project-istio.gateways.index');
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
