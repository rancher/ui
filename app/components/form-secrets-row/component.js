import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';

export default Component.extend({
  layout,
  tagName: 'tr',
  secrets: null,
  allSecrets: computed('secrets.@each.{sourceName}', function() {
    return get(this, 'secrets').map(s => { return {id: get(s, 'id'), label: get(s, 'name')} })
  }),
  secret: null,
  usePrefix: false,
  editing: true,
  disableTarget: true,
  secretSet: computed('secret.sourceName', function() {
    return get(this, 'secret.sourceName') ? false : true;
  }),
  sourceKey: computed({
    get(key) {
      return get(this, 'secret.sourceKey');
    },
    set(key, value) {
      let out = get(this, 'secret.sourceKey');

      if (value === 'prefix') {
        out = "prefix";
        //need to do something with all keys of secret data eg create a bunch of entires
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
      let secret = get(this, 'secrets').findBy('id', selectedSecret);
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
