import Route from '@ember/routing/route';

export default Route.extend({
  redirect: function() {
    debugger;
    this.transitionTo('accounts');
  }
});
