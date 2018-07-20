import Mixin from '@ember/object/mixin';
import { get, set, computed } from '@ember/object';

export default Mixin.create({

  // Inputs from component caller
  volume:      null,
  editing:     null,
  sourceStore: null, // set to clusterStore for cluster volumes

  // From the volume plugin
  field:     null, // the name of the field on the volume
  fieldType: null, // the type of the resource that goes in the field

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
    const config = store.createRecord({ type: get(this, 'fieldType') });

    const schema = store.getById('schema', (get(this, 'fieldType') || '').toLowerCase());

    if ( schema && schema.typeifyFields ) {
      if ( (schema.typeifyFields || []).indexOf('secretRef') > -1 ) {
        get(config, 'secretRef') || set(config, 'secretRef', {});
      }
    }

    return config;
  },
});
