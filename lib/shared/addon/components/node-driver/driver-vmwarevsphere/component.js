import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';

export default Component.extend(NodeDriver, {
  layout,
  driverName         : 'vmwarevsphere',
  model              : null,
  config             : alias('model.vmwarevsphereConfig'),
  showEngineUrl      : false,

  bootstrap: function() {
    let config = this.get('globalStore').createRecord({
      type: 'vmwarevsphereConfig',
      password: '',
      cpuCount: 2,
      memorySize: 2048,
      diskSize: 20000,
      vcenterPort: 443
    });

    this.set('model', this.get('globalStore').createRecord({
      type:         'machineTemplate',
      driver:       'vmwarevsphere',
      vmwarevsphereConfig: config
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
