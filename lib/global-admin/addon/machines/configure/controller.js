import Controller from '@ember/controller'

export default Controller.extend({
  actions: {
    launch() {
      this.transitionToRoute('machines.launch');
    },
    add() {
      this.transitionToRoute('machines.configure');
    },
  }
});
