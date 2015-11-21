import Ember from 'ember';
import MultiStatsSocket from 'ui/utils/multi-stats';

export default Ember.Route.extend({
  statsSocket: null,

  model() {
    var promises = [];

    // Load the hosts for the instances if they're not already there
    var service = this.modelFor('service').get('service');
    service.get('instances').forEach((instance) => {
      if ( !instance.get('primaryHost') )
      {
        promises.push(instance.importLink('hosts'));
      }
    });

    return Ember.RSVP.all(promises).then(() => {
      return service;
    });
  },

  activate() {
    var stats = MultiStatsSocket.create({
      resource: this.modelFor('service').get('service'),
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
