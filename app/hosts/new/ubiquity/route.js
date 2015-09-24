import DriverRoute from 'ui/hosts/new/driver-route';

export default DriverRoute.extend({
  driverName: 'ubiquity',

  newModel: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type: '',
      apiToken: '37c658903d884555b3d610a5a57b867f',
      apiUsername: 'ubic-29497',
      clientId: '29497',
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
