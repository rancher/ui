import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['id'],

  actions: {
    done() {
      return this.transitionToRoute('project-istio.gateways.index');
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
