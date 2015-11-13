import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.modelFor('environment').get('stack');
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.setProperties({
        showServiceInfo: null,
        selectedService: null,
      });
    }
  }
});
