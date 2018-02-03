import Controller from '@ember/controller';

export default Controller.extend({
  availableDrivers: null,
  driver: null,

  queryParams: ['driver'],

  actions: {
    completed(/* neu */) {
      this.transitionToRoute('machines');
    },
    goBack() {
      this.transitionToRoute('machines');
    }
  }
});
