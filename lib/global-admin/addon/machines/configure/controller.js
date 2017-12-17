import Controller from '@ember/controller';
import { get, set } from '@ember/object';

export default Controller.extend({
  availableDrivers: null,
  driver: null,

  actions: {
    completed(/* neu */) {
      this.transitionToRoute('machines.templates');
    },
    goBack() {
      this.transitionToRoute('machines.templates');
    }
  }
});
