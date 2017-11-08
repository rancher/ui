import EmberObject from '@ember/object';
import { hash, all } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function(params) {
    var store = this.get('store');

    return store.findAll('host').then((hosts) => {

      return hash({
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

          return all(promises).then(() => {
            return EmberObject.create({
              all:          hosts,
              host:         hash.host,
              storagePools: out
            });
          });
        });
      });
    });
  },
});
