import Mixin from '@ember/object/mixin';
import { get, set, setProperties, computed } from '@ember/object';
export default Mixin.create({
  parameters: null,
  editing: null,
  fields: [],
  model: null,

  init() {
    this._super(...arguments);
    this.sendAction('registerHook', this.updateParams.bind(this), {name: 'updateParams'});
  },

  updateParams() {
    // Override this to handle custom parameters
    //
    const fields = get(this, 'fields') || [];
    if (fields.length > 0) {
      const out = {};
      fields.forEach(field => {
        const key = field.id ? field.id : field;
        const value = get(this, `model.${key}`) || '';
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
      fields.forEach(field => {
        const key = field.id ? field.id : field;
        changes[key] = get(this, `parameters.${key}`) || get(field, 'options.firstObject.value') || '';
      });
      setProperties(this, {
        model: changes
      });
    }
  },

  didInsertElement() {
    const fields = get(this, 'fields') || [];
    if (fields.length > 0) {
      fields.forEach(field => {
        const key = field.id ? field.id : field;
        this.addObserver(`model.${key}`, this, 'sendUpdate');
      });
      this.sendUpdate();
    }
  },

  fieldsGroup: computed('fields.[]', function () {
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
