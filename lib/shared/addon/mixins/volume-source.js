import Mixin from '@ember/object/mixin';
import { get, set, computed, setProperties } from '@ember/object';

export default Mixin.create({

  // Inputs from component caller
  volume:      null,
  editing:     null,
  sourceStore: null, // set to clusterStore for cluster volumes

  // From the volume plugin
  field:       null, // the name of the field on the volume

  config: computed('field', function() {
    const volume = get(this, 'volume');
    const field = get(this, 'field');

    let config = get(volume, field);

    if ( !config ) {
      config = this.configForNew();
      set(volume, field, config);
    }

    return config;
  }),

  configForNew() {
    // Override to provide a custom empty config

    const store = get(this, 'sourceStore') || get(this, 'store');
    const index = get(this, 'volume.type').lastIndexOf('/') + 1
    const voluemType = get(this, 'volume.type').substr(index).toLowerCase();
    const volumeSchema = store.getById('schema', voluemType);
    const type = get(volumeSchema, `resourceFields.${ get(this, 'field') }.type`).toLowerCase();

    const config = store.createRecord({ type });

    const schema = store.getById('schema', type);

    if ( schema && schema.typeifyFields ) {
      if ( (schema.typeifyFields || []).indexOf('secretRef') > -1 ) {
        get(config, 'secretRef') || set(config, 'secretRef', {});
      }
    }

    if ( get(this, 'initValue') ) {
      setProperties(config, get(this, 'initValue'));
    }

    return config;
  },
});
