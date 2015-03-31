import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.ObjectController.extend({
  lastRoute: 'hosts.new.digitalocean',
  drivers: function() {
    var hasOpenStack = this.get('store').hasRecordFor('schema','openstackconfig');
    var hasAmazon = this.get('store').hasRecordFor('schema','amazonec2config');

    return [
      {route: 'hosts.new.digitalocean', label: 'DigitalOcean',  css: 'digitalocean', available: true  },
      {route: 'hosts.new.amazon',       label: 'Amazon EC2',    css: 'amazon',       available: hasAmazon  },
      {route: 'hosts.new.openstack',    label: 'OpenStack',     css: 'openstack',    available: hasOpenStack },
      {route: 'hosts.new.custom',       label: 'Custom',        css: 'custom',       available: true  },
    ];
  }.property(),

  isAdmin: function() {
    var userType = this.get('session').get(C.USER_TYPE_SESSION_KEY);
    var isAdmin = userType === undefined || userType === C.USER_TYPE_ADMIN;
    return isAdmin;
  }.property(),
});
