import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params, transition*/) {
    return this.get('store').createRecord({
      type: 'certificate'
    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('errors', null);
    }
  }
});
