import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return Ember.Object.create({
      all: this.modelFor('storagepools'),
    });
  },
});
