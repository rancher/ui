import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    save() {
      this.transitionToRoute('hosts');
    },
    cancel() {
      this.transitionToRoute('hosts.container-cloud');
    }
  }
});
