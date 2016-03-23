import DriverRoute from 'ui/hosts/new/driver-route';

export default DriverRoute.extend({
  driverName: 'ubiquity',

  newModel: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type: 'ubiquityConfig',
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
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('errors', null);
      controller.set('step', 1);
    }
  }
});
