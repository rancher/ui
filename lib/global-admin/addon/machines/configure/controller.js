import Controller from '@ember/controller'

export default Controller.extend({
  driver: 'azure', //temp for now
  actions: {
    completed(/* neu */) {
      this.transitionToRoute('machines.templates');
    },
    goBack() {
      this.transitionToRoute('machines.templates');
    }
  }
});
