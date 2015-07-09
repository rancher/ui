import DriverRoute from 'ui/hosts/new/driver-route';

export default DriverRoute.extend({
  driverName: 'exoscale',

  newModel: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type: 'exoscaleConfig',
      apiKey: '',
      apiSecretKey: '',
      diskSize: 50,
      instanceProfile: 'small',
      securityGroup: 'rancher-machine'
    });

    return store.createRecord({
      type: 'machine',
      exoscaleConfig: config
    });
  }

});
