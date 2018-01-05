import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['stackId','serviceId'],
  stackId: null,
  serviceId: null,

  actions: {
    done() {
      return this.transitionToRoute('dns');
    },

    cancel() {
      this.send('goToPrevious');
    },
  },
});
