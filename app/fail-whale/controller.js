import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    gotoDashboard() {
      const url = this.get('model.dashboardLink') || '/';

      window.location.href = url;
    },
  },
});
