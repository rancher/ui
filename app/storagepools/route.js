import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    let store = this.get('store');
    return Ember.RSVP.hash({
      pools:     store.findAllUnremoved('storagepool'),
      mounts:    store.findAllUnremoved('mounts'),
      snapshots: store.findAllUnremoved('snapshots'),
      backups:   store.findAllUnremoved('backups'),
    }).then((hash) => {
      return hash.pools.filter((pool) => {
        return !!pool.get('driverName');
      });
    });
  },
});
