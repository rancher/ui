import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['id'],
  id:          null,

  actions: {
    back() {
      this.transitionToRoute('authenticated.project.config-maps');
    },
  },
});
