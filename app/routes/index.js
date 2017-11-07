import Route from '@ember/routing/route';

export default Route.extend({
  actions: {
    activate: function() {
      this.transitionTo('authenticated');
    },
  }
});
