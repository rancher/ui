import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var store = this.get('store');

    return store.findAll('host').then((all) => {

      return Ember.RSVP.hash({
        host:     store.find('host', params.host_id),
        service:  store.findAll('service'),
        instance: store.findAll('instance'),
      }).then((hash) => {

        return hash.host.followLink('storagePools').then((pools) => {

          var out = [];
          var promises = pools.map((pool) => {
            return pool.followLink('volumes',{include: ['mounts']}).then((volumes) => {
              out.pushObjects((volumes||[]).toArray());
            });
          });

          return Ember.RSVP.all(promises).then(() => {
            return Ember.Object.create({
              all:          all,
              host:         hash.host,
              storagePools: out
            });
          });
        });
      });
    });
  },
});
