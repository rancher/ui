import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    back() {
      this.transitionToRoute('authenticated.cluster.storage.classes');
    },
  },
});
