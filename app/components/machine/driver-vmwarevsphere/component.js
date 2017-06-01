import Ember from 'ember';
import Driver from 'ui/mixins/driver';

export default Ember.Component.extend(Driver, {
  driverName         : 'vmwarevsphere',
  model              : null,
  config             : Ember.computed.alias('model.publicValues.vmwarevsphereConfig'),
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
      type:         'hostTemplate',
      driver:       'vmwarevsphere',
      publicValues: {
        vmwarevsphereConfig: config
      },
      secretValues: {
        vmwarevsphereConfig: {
          password: '',
        }
      }
    }));
  },

  validate() {
    let errors = [];

    if ( !this.get('model.name') ) {
      errors.push('Name is required');
    }

    this.set('errors', errors);
    return errors.length === 0;
  },
});
