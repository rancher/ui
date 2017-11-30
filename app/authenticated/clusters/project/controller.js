import Controller from '@ember/controller';

export default Controller.extend({
  model: null,

  actions: {
    done() {
      this.transitionToRoute('global-admin.clusters');
    },

    cancel() {
      this.transitionToRoute('global-admin.clusters');
    },
  },
});
