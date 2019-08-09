import Controller from '@ember/controller';

export default Controller.extend({
  parentRoute: 'global-admin.cluster-templates.index',

  actions: {
    cancel() {
      this.send('goToPrevious', this.parentRoute);
    },
    done() {
      this.transitionToRoute('cluster-templates.index');
    },
  }
});
