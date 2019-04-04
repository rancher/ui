import Route from '@ember/routing/route';

export default Route.extend({
  redirect() {
    this.replaceWith('authenticated.cluster.monitoring.index');
  },
});
