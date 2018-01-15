import Controller from '@ember/controller'

export default Controller.extend({
  actions: {
    completed(/* neu */) {
      this.transitionToRoute('authenticated.cluster.nodes.index');
    },
    goBack() {
      this.transitionToRoute('authenticated.cluster.nodes.templates');
    }
  }
});
