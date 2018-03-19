import Mixin from '@ember/object/mixin';
import { get, set, computed, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';

export default Mixin.create({
  clusterStore: service(),
  // Inputs from comonent caller
  volume: null,
  editing: null,

  // Override from component definition
  plugin: null,
  fields: null,

  // Locals
  config: null,

  didReceiveAttrs() {
    this._super(...arguments);
    const plugin = get(this, 'plugin');
    const typeName = this.getTypeName();
    const schema = get(this, 'clusterStore').getById('schema', typeName);
    const resourceFields = get(schema, 'resourceFields');

    const changes = {};
    const fields = [];
    Object.keys(resourceFields).forEach(key => {
      const field = resourceFields[key];
      set(field, 'fieldKey', key);
      fields.push(field);
      const value = get(this, `volume.${plugin}.${key}`);
      if (value !== undefined) {
        changes[key] = value;
      } else if (get(field, 'default') !== undefined) {
        changes[key] = get(field, 'default')
      } else if (get(field, 'type') === 'localObjectReference') {
        changes[key] = {
          name: '',
        };
      } else if (get(field, 'type') === 'objectReference') {
        changes[key] = {
          name: '',
        };
      } else if (get(field, 'type') === 'localObjectReference') {
        changes[key] = {
          name: '',
          namespace: '',
        };
      } else if (get(field, 'type') === 'secretReference') {
        changes[key] = {
          name: '',
          namespace: '',
        };
      } else if (get(field, 'type') === 'array[string]') {
        changes[key] = [];
      } else if (get(field, 'type') === 'map[string]') {
        changes[key] = {};
      } else {
        changes[key] = '';
      }
    });
    setProperties(this, {
      config: changes,
      fields,
    });
    this.sendUpdate();
  },

  sendUpdate: function () {
    const plugin = get(this, 'plugin');
    const fields = get(this, 'fields') || [];
    const out = {};
    fields.forEach(field => {
      const key = field.fieldKey;
      const value = get(this, `config.${key}`);
      if (value !== undefined && value !== '') {
        out[key] = value;
      }
    });
    console.log(plugin, out)
    this.sendAction('changed', plugin, out);
  },

  getTypeName: function () {
    const plugin = get(this, 'plugin');
    return get(this, 'clusterStore').getById('schema', 'persistentvolume').resourceFields[plugin].type.toLocaleLowerCase();
  },

  actions: {
    updateOptions(key, ary) {
      set(this, `config.${key}`, ary);
    },
  }
});
