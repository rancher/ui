import Ember from 'ember';
import MultiStatsSocket from 'ui/utils/multi-stats';

export default Ember.Route.extend({
  statsSocket: null,

  model() {
    // Load the hosts for the instances if they're not already there
    var service = this.modelFor('service').get('service');
    return service;
  },

  setupController() {
    this._super.apply(this,arguments);
    this.connectStats();
  },

  connectStats() {
    var stats = this.get('statsSocket');
    if ( stats )
    {
      stats.close();
    }

    stats = MultiStatsSocket.create({
      resource: this.modelFor('service').get('service'),
      linkName: 'containerStats',
    });

    this.set('statsSocket', stats);
    stats.on('dataPoint', (data) => {
      var controller = this.get('controller');
      if (controller) {
        controller.onDataPoint(data);
      }
    });
  },

  deactivate() {
    this.get('statsSocket').close();
  }
});
