import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.modelFor('authenticated');
  },

  setupController(controller/*, model*/) {
    this._super(...arguments);
    controller.isReadyChanged();
  }
});
