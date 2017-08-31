import Ember from 'ember';

export default Ember.Controller.extend({
  model: null,

  actions: {
    done() {
      this.transitionToRoute('authenticated.clusters');
    },

    cancel() {
      this.transitionToRoute('authenticated.clusters');
    },
  },
});
