import DriverRoute from 'ui/hosts/new/driver-route';

export default DriverRoute.extend({
  driverName: 'azure',

  newModel: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type                  : 'azureConfig',
      dockerPort            : '',
      dockerSwarmMasterPort : '',
      image                 : '',
      location              : 'East US',
      password              : '',
      publishSettingsFile   : '',
      size                  : 'ExtraSmall',
      sshPort               : '',
      subscriptionCert      : '',
      subscriptionId        : '',
      username              : '',
    });

    return store.createRecord({
      type: 'machine',
      azureConfig: config,
    });
  },
});
