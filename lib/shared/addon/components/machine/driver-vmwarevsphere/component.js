import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import Driver from 'shared/mixins/host-driver';
import layout from './template';

export default Component.extend(Driver, {
  layout,
  driverName         : 'vmwarevsphere',
  model              : null,
  config             : alias('model.publicValues.vmwarevsphereConfig'),
  showEngineUrl      : false,

  bootstrap: function() {
    let config = this.get('globalStore').createRecord({
      type: 'vmwarevsphereConfig',
      cpuCount: 2,
      memorySize: 2048,
      diskSize: 20000,
      vcenterPort: 443
    });

    this.set('model', this.get('globalStore').createRecord({
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
