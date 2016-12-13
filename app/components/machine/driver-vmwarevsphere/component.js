import Ember from 'ember';
import Driver from 'ui/mixins/driver';

export default Ember.Component.extend(Driver, {
  driverName         : 'vmwarevsphere',
  model              : null,
  config             : Ember.computed.alias('model.vmwarevsphereConfig'),
  showEngineUrl      : false,

  bootstrap: function() {
    let config = this.get('store').createRecord({
      type: 'vmwarevsphereConfig',
      cpuCount: 2,
      memorySize: 2048,
      diskSize: 20000,
      vcenterPort: 443
    });

    this.set('model', this.get('store').createRecord({
      type: 'host',
      vmwarevsphereConfig: config,
      engineInstallUrl: '',
    }));
  },
});
