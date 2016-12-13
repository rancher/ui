import Ember from 'ember';

export default Ember.Route.extend({
  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('search', '');
    }
  }
});
