import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['id', 'type'],

  actions: {
    back() {
      this.transitionToRoute('authenticated.project.registries');
    },
  },
});
