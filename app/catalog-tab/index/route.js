import Route from '@ember/routing/route';

export default Route.extend({
  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('search', '');
    }
  }
});
