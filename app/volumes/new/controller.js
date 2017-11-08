import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['volumeId','stackId','volumeTemplateId'],
  volumeId: null,
  volumeTemplateId: null,
  stackId: null,

  actions: {
    done() {
      return this.transitionToRoute('volumes.index');
    },

    cancel() {
      this.send('goToPrevious','volumes.index');
    },
  },
});
