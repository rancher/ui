import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    willTransition: function() {
      this.controller.set('showAddtlInfo', null);
    },
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('showAddtlInfo', false);
    }
  },
});
