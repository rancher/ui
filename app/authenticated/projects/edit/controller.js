import Ember from 'ember';

export default Ember.Controller.extend({
  model: null,

  actions: {
    done() {
      this.transitionToRoute('authenticated.projects');
    },

    cancel() {
      this.transitionToRoute('authenticated.projects');
    },
  },
});
