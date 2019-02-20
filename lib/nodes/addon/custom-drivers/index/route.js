import Route from '@ember/routing/route';

export default Route.extend({
  redirect(model, transition) {
    if (transition.targetName === 'nodes.custom-drivers.index') {
      this.replaceWith('custom-drivers.cluster-drivers');
    }
  }
});
