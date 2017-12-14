import Controller from '@ember/controller'
import { get } from '@ember/object';

export default Controller.extend({
  actions: {
    launch(template) {
      this.transitionToRoute('authenticated.cluster.nodes.launch', get(template, 'id'));
    },
    add() {
      this.transitionToRoute('authenticated.cluster.nodes.configure');
    },
  }
});
