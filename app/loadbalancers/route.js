import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    return store.findAllUnremoved('host').then(() => {
      return store.findAllUnremoved('loadbalancer');
    });
  },
});
