import Mixin from '@ember/object/mixin';
import { get, set, setProperties, computed } from '@ember/object';
export default Mixin.create({
  parameters: null,
  editing:    null,
  fields:     null,
  model:      null,

  init() {
    if ( !get(this, 'fields') ) {
      set(this, 'fields', []);
    }

    this._super(...arguments);
    if (this.registerHook) {
      this.registerHook(this.updateParams.bind(this), { name: 'updateParams' });
    }
  },

  updateParams() {
    // Override this to handle custom parameters
    //
    const fields = get(this, 'fields') || [];

    if (fields.length > 0) {
      const out = {};

      fields.forEach((field) => {
        const key = field.id ? field.id : field;
        const value = get(this, `model.${ key }`) || '';

        if (value) {
          out[key] = value;
        }
      });

      set(this, 'parameters', out);
    }
  },

  didReceiveAttrs() {
    const fields = get(this, 'fields') || [];

    if (fields.length > 0) {
      const changes = {};

      fields.forEach((field) => {
        const key = field.id ? field.id : field;

        changes[key] = get(this, `parameters.${ key }`) || get(field, 'options.firstObject.value') || '';
      });
      setProperties(this, { model: changes });
    }
  },

  fieldsGroup: computed('fields.[]', function() {
    const fields = get(this, 'fields') || [];
    const group = [];
    let groupIndex = 0;

    fields.forEach((item, index) => {
      if (index % 3 === 0) {
        group.push([item]);
        groupIndex++;
      } else {
        group[groupIndex - 1].push(item);
      }
    });

    return group;
  }),
});
