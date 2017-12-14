import Controller from '@ember/controller'
import { get } from '@ember/object';

export default Controller.extend({
  actions: {
    launch(template) {
      this.transitionToRoute('machines.launch', get(template, 'id'));
    },
    add() {
      this.transitionToRoute('machines.configure');
    },
  }
});
