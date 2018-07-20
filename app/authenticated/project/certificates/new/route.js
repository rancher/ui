import Route from '@ember/routing/route';

export default Route.extend({
  model(/* params, transition*/) {
    return this.get('store').createRecord({ type: 'certificate' });
  },

  resetController(controller, isExiting/* , transition*/) {
    if (isExiting) {
      controller.set('errors', null);
    }
  }
});
