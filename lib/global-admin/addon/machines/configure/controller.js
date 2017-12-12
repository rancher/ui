import Controller from '@ember/controller'

export default Controller.extend({
  driver: 'azure', //temp for now
  actions: {
    completed(nue) {
      debugger;
    },
    goBack() {
      this.transistionToRoute('machines.templates');
    }
  }
});
