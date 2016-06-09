import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAllUnremoved('storagepool').then((pools) => {
      var promises = [];
      pools.filter((pool) => {
        return !!pool.get('driverName');
      }).forEach((pool) => {
        (pool.get('volumes')||[]).forEach((volume) => {
          promises.push(volume.importLink('mounts'));
          promises.push(volume.importLink('snapshots')); // snapshots will be in the individual pool items
          promises.push(volume.importLink('backups'));
        });
      });

      return Ember.RSVP.all(promises).then(() => {
        return pools;
      });
    });
  },
});
