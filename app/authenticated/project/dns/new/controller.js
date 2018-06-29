import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    done() {

      return this.transitionToRoute('authenticated.project.dns.index');

    },

    cancel() {

      this.send('goToPrevious');

    },
  },
});
