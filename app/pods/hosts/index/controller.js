import Cattle from '../../../utils/cattle';

export default Cattle.CollectionController.extend({
  dot: false,
  queryParams: ['dot'],
  itemController: 'host',

  byZone: function() {
    var zones = {};
    var hosts = this.get('content');

    hosts.forEach(function(host) {
      var zoneId = host.get('zoneId');
      if ( !zones[zoneId] )
      {
        zones[zoneId] = {
          zone: host.get('zone'),
          hosts: []
        };
      }

      zones[zoneId].hosts.push(host);
    });

    return zones;
  }.property('content.[]'),
});
