import Ember from 'ember';
import MultiStatsSocket from 'ui/utils/multi-stats';

export default Ember.Route.extend({
  statsSocket: null,

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

  afterModel() {
    this.setupSocketConnection();
  },

  setupSocketConnection: function() {

    if (this.get('statsSocket')) {
      this.deactivate();
    }

    let stats = MultiStatsSocket.create({
      resource: this.modelFor('host').get('host'),
      linkName: 'containerStats',
    });

    this.set('statsSocket',stats);

    stats.on('dataPoint', (data) => {
      let controller = this.get('controller');

      if ( controller )
      {
        controller.onDataPoint(data);
      }
    });

  },

  deactivate() {
    this.get('statsSocket').close();
  }
});
