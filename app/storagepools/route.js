import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    let store = this.get('store');
    return Ember.RSVP.hash({
      pools:     store.findAll('storagepool'),
      mounts:    store.findAll('mounts', {filter: {'state_ne': 'inactive'}}),
    }).then((hash) => {
      return hash.pools.filter((pool) => {
        return !!pool.get('driverName');
      });
    });
  },
});
