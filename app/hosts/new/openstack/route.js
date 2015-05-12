import DriverRoute from 'ui/hosts/new/driver-route';

export default DriverRoute.extend({
  driverName: 'openstack',
  newModel: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type: 'openstackConfig',
      authUrl: '',
      username: '',
      password: '',
      tenantName: '',
      flavorName: '',
      imageName: '',
    });

    return this.get('store').createRecord({
      type: 'machine',
      openstackConfig: config,
    });
  },
});
