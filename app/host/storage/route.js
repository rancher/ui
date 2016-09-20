import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var host = this.modelFor('host').get('host');
    var out = [];
    return host.followLink('storagePools').then((pools) => {
      var promises = pools.map((pool) => {
        return pool.followLink('volumes',{include: ['mounts']}).then((volumes) => {
          out.pushObjects((volumes||[]).toArray());
        });
      });

      return Ember.RSVP.all(promises).then(() => {
        return out;
      });
    });
  }
});
