import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.ObjectController.extend({
  lastRoute: 'hosts.new.digitalocean',
  drivers: function() {
    var hasOpenStack = this.get('store').hasRecordFor('schema','openstackconfig');
    var hasAmazon = this.get('store').hasRecordFor('schema','amazonec2config');
    var hasPacket = this.get('store').hasRecordFor('schema','packetconfig');

    return [
      {route: 'hosts.new.digitalocean', label: 'DigitalOcean',  css: 'digitalocean', available: true  },
      {route: 'hosts.new.amazonec2',    label: 'Amazon EC2',    css: 'amazon',       available: hasAmazon  },
      {route: 'hosts.new.packet',       label: 'Packet',        css: 'packet',       available: hasPacket },
      {route: 'hosts.new.openstack',    label: 'OpenStack',     css: 'openstack',    available: hasOpenStack },
      {route: 'hosts.new.custom',       label: 'Custom',        css: 'custom',       available: true  },
    ];
  }.property(),

  isAdmin: function() {
    var userType = this.get('session').get(C.SESSION.USER_TYPE);
    var isAdmin = userType === undefined || userType === C.USER.TYPE_ADMIN;
    return isAdmin;
  }.property(),
});
