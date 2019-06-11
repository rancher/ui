import { get, set, computed } from '@ember/object';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';

export default Component.extend(NodeDriver, {
  layout,
  // Set by Driver
  driverName: null,

  typeDocumentations: null,
  config:             null,

  init() {
    this._super(...arguments);

    if ( get(this, 'editing') && get(this, 'driverName') ) {
      const config = get(this, `model.${ get(this, 'driverName') }Config`);

      set(this, 'config', config);
    }
  },

  schema: computed('driverName', function() {
    const configName = `${ get(this, 'driverName') }Config`;

    return get(this, 'globalStore').getById('schema', configName.toLowerCase());
  }),

  bootstrap() {
    if (get(this, 'driverName')) {
      const configName = `${ get(this, 'driverName') }Config`;
      let config = get(this, 'globalStore').createRecord({ type: configName, });
      const model = get(this, 'model');

      set(model, configName, config);
      set(this, 'config', config)
    }
  },

  validate() {
    let errors = [];

    if (!get(this, 'model.name')) {
      errors.push('Name is required');
    }

    set(this, 'errors', errors);

    return errors.length === 0;
  },

});
