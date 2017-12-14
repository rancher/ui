import Controller from '@ember/controller'

export default Controller.extend({
  driver: 'azure', //temp for now
  actions: {
    completed(/* neu */) {
      this.transitionToRoute('authenticated.cluster.nodes.index');
    },
    goBack() {
      this.transitionToRoute('authenticated.cluster.nodes.templates');
    }
  }
});
