import Route from '@ember/routing/route';

export default Route.extend({
  redirect: function() {
    this.transitionTo('admin-tab.accounts');
  }
});
