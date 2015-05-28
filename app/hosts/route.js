import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    return store.findAll('machine').then(() => {
      return store.findAll('host');
    });
  },
});
