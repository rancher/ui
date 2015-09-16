import Ember from 'ember';
import MultiStatsSocket from 'ui/utils/multi-stats';

export default Ember.Route.extend({
  statsSocket: null,

  model() {
    return this.modelFor('host');
  },

  activate() {
    var stats = MultiStatsSocket.create({
      resource: this.modelFor('host'),
      linkName: 'containerStats',
    });

    this.set('statsSocket',stats);
    stats.on('dataPoint', (data) => {
      var controller = this.get('controller');
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
