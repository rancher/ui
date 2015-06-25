import Ember from 'ember';
import DriverRoute from 'ui/hosts/new/driver-route';

export default DriverRoute.extend({
  prefs: Ember.inject.service(),

  driverName: 'amazonec2',
  newModel: function() {
    var store = this.get('store');
    var pref = this.get('prefs.amazonec2')||{};

    var config = store.createRecord({
      type: 'amazonec2Config',
      region: 'us-west-2',
      instanceType: 't2.micro',
      securityGroup: 'rancher-machine',
      zone: 'a',
      rootSize: 16,
      accessKey: pref.accessKey||'',
      secretKey: pref.secretKey||'',
    });

    return this.get('store').createRecord({
      type: 'machine',
      amazonec2Config: config,
    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
    this._super();
    if (isExiting)
    {
      controller.setProperties({
        step: 1,
        machineId: null,
        clients: null,
        allSubnets: null,
        allSecurityGroups: null,
        whichSecurityGroup: 'default',
      });
    }
  },

  renderTemplate: function() {
    this.render({into: 'hosts/new'});
  },
});
