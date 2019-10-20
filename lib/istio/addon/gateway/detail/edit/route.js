import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    const original = this.modelFor('gateway.detail');

    return original.clone();
  },
});
