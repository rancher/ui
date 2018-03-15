import Mixin from '@ember/object/mixin';
import { get, setProperties, computed } from '@ember/object';
export default Mixin.create({
  parameters: null,
  editing: null,
  fields: [],
  model: null,

  didInsertElement() {
    const fields = get(this, 'fields') || [];
    if (fields.length > 0) {
      fields.forEach(field => {
        this.addObserver(`model.${field}`, this, 'sendUpdate');
      });
      this.sendUpdate();
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

  didReceiveAttrs() {
    const fields = get(this, 'fields') || [];
    if (fields.length > 0) {
      const changes = {};
      fields.forEach(field => {
        changes[field] = get(this, `parameters.${field}`) || '';
      });
      setProperties(this, {
        model: changes
      });
    }
  },

  sendUpdate: function () {
    const fields = get(this, 'fields') || [];
    if (fields.length > 0) {
      const out = {};
      fields.forEach(field => {
        out[field] = get(this, `model.${field}`) || '';
      });
      this.sendAction('changed', out);
    }
  },

  actions: {
    changed(map) {
      this.sendAction('changed', map);
    },
  },
});
