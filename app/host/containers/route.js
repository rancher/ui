import Ember from 'ember';
import MultiStatsSocket from 'ui/utils/multi-stats';

export default Ember.Route.extend({
  statsSocket: null,

  model() {
    return this.modelFor('host').get('host');
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
