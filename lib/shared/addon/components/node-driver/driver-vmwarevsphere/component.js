import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';

const DRIVER = 'vmwarevsphere';
const CONFIG = 'vmwarevsphereConfig';

export default Component.extend(NodeDriver, {
  layout,
  driverName         : DRIVER,
  model              : null,
  config             : alias(`model.${CONFIG}`),
  showEngineUrl      : false,

  bootstrap: function() {
    let config = this.get('globalStore').createRecord({
      type: CONFIG,
      password: '',
      cpuCount: 2,
      memorySize: 2048,
      diskSize: 20000,
      vcenterPort: 443
    });

    set(this, `model.${CONFIG}`, config);
  },
});
