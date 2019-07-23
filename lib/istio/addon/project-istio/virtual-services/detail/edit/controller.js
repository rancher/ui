import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    back() {
      return this.transitionToRoute('project-istio.virtual-services.index');
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
