import Ember from 'ember';

export default Ember.Route.extend({
  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('showAddtlInfo', false);
    }
  },
});
