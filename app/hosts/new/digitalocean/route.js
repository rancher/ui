import DriverRoute from 'ui/hosts/new/driver-route';

export default DriverRoute.extend({
  driverName: 'digitalocean',

  newModel: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type: 'digitaloceanConfig',
      accessToken: '',
      size: '1gb',
      region: 'nyc3',
      image: 'ubuntu-14-04-x64'
    });

    return store.createRecord({
      type: 'machine',
      digitaloceanConfig: config,
    });
  }
});
