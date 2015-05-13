import DriverRoute from 'ui/hosts/new/driver-route';

export default DriverRoute.extend({
  driverName: 'amazonec2',
  newModel: function() {
    var store = this.get('store');

    var config = store.createRecord({
      type: 'amazonec2Config',
      region: 'us-east-1',
      instanceType: 't2.micro',
      securityGroup: 'docker-machine',
      zone: 'a',
      rootSize: 16
    });

    return this.get('store').createRecord({
      type: 'machine',
      amazonec2Config: config,
    });
  },

  setupController: function(controller/*, model*/) {
    controller.set('vpcOrSubnetId', null);
    this._super.apply(this, arguments);
  },

  renderTemplate: function() {
    this.render({into: 'hosts/new'});
  },
});
