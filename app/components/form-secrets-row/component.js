import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';

export default Component.extend({
  layout,
  tagName: 'tr',
  secrets: null,
  allSecrets: computed('secrets.@each.{sourceName}', function() {
    return get(this, 'secrets').map(s => { return {id: get(s, 'name'), label: get(s, 'name')} }).sortBy('label');
  }),
  secret: null,
  usePrefix: false,
  editing: true,
  disableTarget: true,
  secretSet: computed('secret.sourceName', function() {
    return get(this, 'secret.sourceName') ? false : true;
  }),

  prefixOrTarget: computed('sourceKey', {
    get(key) {
      if (get(this, 'sourceKey') === 'prefix') {
        return get(this, 'secret.prefix');
      } else {
        return get(this, 'secret.targetKey');
      }
    },
    set(key, value) {
      if (get(this, 'sourceKey') === 'prefix') {
        return set(this, 'secret.prefix', value);
      } else {
        return set(this, 'secret.targetKey', value);
      }
    }
  }),
  sourceKey: computed({
    get(key) {
      let nue = key;
      if (get(this, 'secret.prefix')) {
        nue = 'prefix';
      }
      return get(this, `secret.${nue}`);
    },
    set(key, value) {
      let out = get(this, 'secret.sourceKey');

      if (value === 'prefix') {
        // TODO verify that when prefix is set we do not set the sourceKey
        out = "prefix";
      } else {
        set(this, 'secret.sourceKey', value);
      }

      set(this, 'disableTarget', false)

      return out;
    },
  }),
  prefixOrKeys: computed('allSecrets.[]', 'secret.sourceName', function() {
    let prefix = { id: 'prefix', label: 'Prefix'};
    let selectedSecret = get(this, 'secret.sourceName');
    let out = [prefix];
    if (selectedSecret) {
      let secret = get(this, 'secrets').findBy('name', selectedSecret);
      let secretKeys = Object.keys(get(secret, 'data'));
      if (secretKeys) {
        secretKeys.forEach((sk) => {
          out.addObject({id: sk, label: sk});
        })
      }
    }

    return out;
  }),

});
