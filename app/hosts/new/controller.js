import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.ObjectController.extend({
  lastRoute: 'hosts.new.digitalocean',
  drivers: function() {
    var hasOpenStack = this.get('store').hasRecordFor('schema','openstackconfig') && false;
    var hasAmazon = this.get('store').hasRecordFor('schema','amazonec2config');
    var hasPacket = this.get('store').hasRecordFor('schema','packetconfig');
    var hasRackSpace = this.get('store').hasRecordFor('schema','rackspaceconfig');
    var hasExoscale = this.get('store').hasRecordFor('schema', 'exoscaleconfig');

    return [
      {route: 'hosts.new.digitalocean', label: 'DigitalOcean',  css: 'digitalocean', available: true  },
      {route: 'hosts.new.amazonec2',    label: 'Amazon EC2',    css: 'amazon',       available: hasAmazon  },
      {route: 'hosts.new.packet',       label: 'Packet',        css: 'packet',       available: hasPacket },
      {route: 'hosts.new.rackspace',    label: 'RackSpace',     css: 'rackspace',    available: hasRackSpace },
      {route: 'hosts.new.openstack',    label: 'OpenStack',     css: 'openstack',    available: hasOpenStack },
      {route: 'hosts.new.exoscale',     label: 'Exoscale',      css: 'exoscale',     available: hasExoscale },
      {route: 'hosts.new.custom',       label: 'Custom',        css: 'custom',       available: true  },
    ];
  }.property(),

  isAdmin: function() {
    var userType = this.get('session').get(C.SESSION.USER_TYPE);
    var isAdmin = userType === undefined || userType === C.USER.TYPE_ADMIN;
    return isAdmin;
  }.property(),
});
