import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    back() {
      this.send('goToPrevious','authenticated.project.config-maps.index');
    },
  },
});
