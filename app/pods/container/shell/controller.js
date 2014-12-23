import Ember from "ember";

export default Ember.ObjectController.extend({
  actions: {
    cancel: function() {
      this.transitionToRoute('hosts');
    }
  }
});
