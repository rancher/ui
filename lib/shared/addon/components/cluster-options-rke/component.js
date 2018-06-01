import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import YAML from 'npm:yamljs';
import json2yaml from 'npm:json2yaml';

function removeEmpty(obj){
  return Object.keys(obj)
    .filter(k => obj[k] !== null && obj[k] !== undefined && (typeof obj[k] !== 'object' || (Object.keys(obj[k]).filter((key) => key !== 'type').length)))
    .reduce((newObj, k) =>
      typeof obj[k] === 'object' ?
        Object.assign(newObj, {[k]: removeEmpty(obj[k])}) :
        Object.assign(newObj, {[k]: obj[k]}),
      {});
 }

const BLACK_LIST_FIELD = ['kubernetesVersion', 'cloudProvider', 'ignoreDockerVersion'];

export default Component.extend({
  layout,

  globalStore: service(),
  intl: service(),
  
  config: null,
  advanced: null,
  errors: null,

  originConfigKeys: null,

  getResourceFields: function(type) {
    const schema = get(this, 'globalStore').getById('schema', type.toLowerCase());
    return schema ? get(schema, 'resourceFields') : null;
  },

  getFieldValue: function(field, type) {
    if ( type.startsWith('map[') ) {
      type = type.slice(4, type.length -1);
      const resourceFields = this.getResourceFields(type);
      if ( resourceFields ) {
        if ( field ) {
          const out = {};
          Object.keys(field).forEach((key) => {
            out[key] = this.getFieldValue(field[key], type);
          });
          return out;
        } else {
          return null;
        }
      } else {
        if ( field ) {
          const out = {};
          Object.keys(field).forEach((key) => {
            out[key] = field[key];
          });
          return out;
        } else {
          return null;
        }
      }
    } else if ( type.startsWith('array[') ) {
      type = type.slice(6, type.length -1);
      const resourceFields = this.getResourceFields(type);
      if ( resourceFields ) {
        return field ? field.map((item) => {
          return this.getFieldValue(item, type);
        }) : null;
      } else {
        return field ? field.map((item) => {
          return item;
        }) : null;
      }
    } else {
      const resourceFields = this.getResourceFields(type);
      if ( resourceFields ) {
        const out = {};
        Object.keys(resourceFields).forEach((key) => {
          if ( field !== undefined && field !== null && (typeof field !== 'object' || Object.keys(field).length ) ) {
            out[key] = this.getFieldValue(field[key], resourceFields[key].type);
          }
        });
        return out;
      } else {
        return field;
      }
    }
  },

  getSupportedFields: function(source, tragetField) {
    const out = {};
    const resourceFields = this.getResourceFields(tragetField);
    
    Object.keys(resourceFields).forEach((key) => {
      if ( BLACK_LIST_FIELD.indexOf(key) > -1 ) {
        return;
      }
      const field = get(source, key);
      const type = resourceFields[key].type;
      const value = this.getFieldValue(field, type);
      out[key] = value;
    });

    return out;
  },

  pastedConfig: computed('config', {
    get() {
      const intl = get(this, 'intl');
      let config = this.getSupportedFields(get(this, 'config'), 'rancherKubernetesEngineConfig');
      if ( !config ) {
        return '';
      }
      config = removeEmpty(config);
      while ( JSON.stringify(config) !== JSON.stringify(removeEmpty(config)) ){
        config = removeEmpty(config);
      }

      if ( !get(this, 'originConfigKeys') ) {
        const originConfigKeys = [];
        Object.keys(config).forEach((key) => {
          originConfigKeys.push(key);
        });
        set(this, 'originConfigKeys', originConfigKeys);
      }

      let yaml = json2yaml.stringify(config);
      const lines = yaml.split('\n');
      lines.shift();
      let out = '';
      lines.forEach((line) => {
        if ( line.trim() ) {
          const key = `rkeConfigComment.${line.split(':')[0].trim()}`
          if ( intl.exists(key) ) {
            const commentLines = intl.t(key).split('\n');
            commentLines.forEach((commentLine) => {
              out += `# ${commentLine.slice(1, commentLine.length - 1)}\n`;
            });
          }
          out += `${line.slice(2)}\n`;
        }
      });

      return out;
    },

    set(key, value) {
      let configs;
      try {
        configs = YAML.parse(value);
      } catch ( err ) {
        set(this, 'errors', [`Cluster advacned options parse error: ${err.snippet} - ${err.message}`]);
        return value;
      }

      set(this, 'errors', []);
      
      const validFields = this.getResourceFields('rancherKubernetesEngineConfig');
      Object.keys(configs || {}).forEach((key) => {
        if ( validFields[key] ) {
          set(this, `config.${key}`, configs[key]);
        }
      });
      const originConfigKeys = get(this, 'originConfigKeys');
      if ( originConfigKeys ) {
        originConfigKeys.filter((key) => Object.keys(configs || {}).indexOf(key) === -1)
          .forEach((key) => {
            set(this, `config.${key}`, null);
          });
      }
      return value;
    }
  }),
});
