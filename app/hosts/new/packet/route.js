import DriverRoute from 'ui/hosts/new/driver-route';

export default DriverRoute.extend({
  driverName: 'packet',

  newModel: function() {
    var store = this.get('store');
    var config = store.createRecord({
      type: 'packetConfig',
      apiKey: '',
      projectId: '',
      os: 'ubuntu_14_04',
      facilityCode: 'ewr1',
      plan: 'baremetal_1',
      billingCycle: 'hourly',
    });

    return this.get('store').createRecord({
      type: 'machine',
      packetConfig: config,
    });
  }
});
