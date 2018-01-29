import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed'
import layout from './template';
import Driver from 'shared/mixins/host-driver';
import Component from '@ember/component';

export default Component.extend(Driver, {
  layout,
  model:                      null,

  customConfig: alias('primaryResource.customConfig'),

  validate() {
    let errors = [];
    set(this, 'errors', errors);
    return true;
  },

  bootstrap() {
    let config = get(this, 'globalStore').createRecord({
      type: 'customConfig',
    });

    set(this, 'model', get(this, 'globalStore').createRecord({
      type: 'machineConfig',
      driver: 'custom',
      customConfig: config,
      state: 'to-import',
    }));
  },

  didSave(model) {
    return [model];
  }
});
