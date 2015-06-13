import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    return Ember.RSVP.all([
      store.findAllUnremoved('environment'),
      store.findAllUnremoved('service'),
      store.findAllUnremoved('serviceconsumemap'),
      store.findAllUnremoved('host'),
    ]).then((results) => {
      return Ember.Object.create({
        environments: results[0],
        services: results[1],
        consumeMaps: results[2],
        hosts: results[3],
      });
    });
  }
});
