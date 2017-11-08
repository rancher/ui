import Controller from '@ember/controller';

export default Controller.extend({
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
