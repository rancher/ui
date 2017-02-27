import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  model: function() {
    var store = this.get('store');
    return Ember.RSVP.all([
      store.findAll('stack'),
      store.findAll('service'),
    ]).then((results) => {
      return Ember.Object.create({
        stacks: results[0],
        services: results[1],
      });
    });
  },
});
