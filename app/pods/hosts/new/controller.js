import Ember from 'ember';

var DRIVERS = [
  {route: 'hosts.new.digitalocean',   label: 'DigitalOcean',      available: true },
  {route: 'hosts.new.openstack',      label: 'OpenStack',         available: false },
  {route: 'hosts.new.custom',         label: 'Custom/Bare Metal', available: true  },
];

export default Ember.ObjectController.extend({
  lastRoute: 'hosts.new.custom',
  drivers: DRIVERS,
});
