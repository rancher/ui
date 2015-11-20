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
        });
      });

      return Ember.RSVP.all(promises).then(() => {
        return pools;
      });
    });
  },
});
