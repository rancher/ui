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
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('errors', null);
      controller.set('step', 1);
    }
  }
});
