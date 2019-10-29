import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['id'],

  actions: {
    done() {
      return this.transitionToRoute('project-istio.virtual-services.index');
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
