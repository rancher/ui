import DriverRoute from 'ui/hosts/new/driver-route';

export default DriverRoute.extend({
  driverName: 'rackspace',
  newModel: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type: 'rackspaceConfig',
      username: '',
      apiKey: '',
      region: 'DFW',
      flavorId: 'general1-1',
    });

    return this.get('store').createRecord({
      type: 'machine',
      rackspaceConfig: config,
    });
  },
});
