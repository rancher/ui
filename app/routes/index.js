import Route from '@ember/routing/route';

export default Route.extend({
  actions: {
    activate() {
      this.transitionTo('authenticated');
    },
  }
});
