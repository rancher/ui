import Ember from 'ember';

export default Ember.ObjectController.extend({
  lastRoute: 'hosts.new.digitalocean',
  drivers: function() {
	  
    var hasAmazon = this.get('store').hasRecordFor('schema','amazonec2config');
    var hasDigitalOcean = this.get('store').hasRecordFor('schema', 'digitaloceanconfig');
    var hasExoscale = this.get('store').hasRecordFor('schema', 'exoscaleconfig');
    var hasOpenStack = this.get('store').hasRecordFor('schema','openstackconfig') && false;
    var hasPacket = this.get('store').hasRecordFor('schema','packetconfig');
    var hasRackSpace = this.get('store').hasRecordFor('schema','rackspaceconfig');
    var hasUbiquity = this.get('store').hasRecordFor('schema','ubiquityconfig');

    return [
      {route: 'hosts.new.amazonec2',          label: 'Amazon EC2',           css: 'amazon',             available: hasAmazon  },
      {route: 'hosts.new.digitalocean',       label: 'DigitalOcean',         css: 'digitalocean',       available: hasDigitalOcean  },
      {route: 'hosts.new.exoscale',           label: 'Exoscale',             css: 'exoscale',           available: hasExoscale },
      {route: 'hosts.new.openstack',          label: 'OpenStack',            css: 'openstack',          available: hasOpenStack },
      {route: 'hosts.new.packet',             label: 'Packet',               css: 'packet',             available: hasPacket },
      {route: 'hosts.new.rackspace',          label: 'RackSpace',            css: 'rackspace',          available: hasRackSpace },
      {route: 'hosts.new.ubiquity',           label: 'Ubiquity Hosting',     css: 'ubiquity',           available: hasUbiquity },
      {route: 'hosts.new.custom',             label: 'Custom',               css: 'custom',             available: true  },
    ];
  }.property(),
});
