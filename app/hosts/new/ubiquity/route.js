import DriverRoute from 'ui/hosts/new/driver-route';

export default DriverRoute.extend({
  driverName: 'ubiquity',

  newModel: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type: '',
      apiToken: '',
      apiUsername: '',
      clientId: '',
      flavorId: '',
      imageId: '',
      zoneId: ''
    });

    return store.createRecord({
      type: 'machine',
      ubiquityConfig: config,
    });
  }
});
