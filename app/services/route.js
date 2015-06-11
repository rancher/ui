import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    return Ember.RSVP.all([
      store.findAllUnremoved('environment'),
      store.findAllUnremoved('service'),
      store.findAllUnremoved('serviceconsumemap'),
    ]);
  }
});
