import { on } from '@ember/object/evented';
import { next, debounce } from '@ember/runloop';
import Component from '@ember/component';
import EmberObject, { get, set, observer } from '@ember/object';
import layout from './template';
import $ from 'jquery';
const SECRET = 'secret';
const CONFIG_MAP = 'configmap';

export default Component.extend({
  layout,
  // Inputs
  initialItems:  null,
  secretName:      null,
  configMapName: null,
  mode:          SECRET,

  editing:       null,
  ary:           null,
  keys:          null,
  allSecrets:    null,
  allConfigMaps: null,

  init() {
    this._super(...arguments);

    const ary = [];
    const items = get(this, 'initialItems');

    if ( get(this, 'mode') === SECRET ) {
      const allSecrets = get(this, 'store').all('secret');
      const namespacedSecrets = get(this, 'store').all('namespacedSecret')
        .filterBy('type', 'namespacedSecret');

      allSecrets.pushObjects(namespacedSecrets);
      set(this, 'allSecrets', allSecrets);
      this.updateSecretKeys();
    }

    if ( get(this, 'mode') === CONFIG_MAP ) {
      const allConfigMaps = get(this, 'store').all('configmap');

      set(this, 'allConfigMaps', allConfigMaps);
      this.updateConfigMapKeys();
    }

    if (items) {
      items.forEach((item) => {
        ary.push(EmberObject.create({
          key:  item.key,
          path: item.path,
          mode: item.mode ? (new Number(item.mode)).toString(8) : null,
        }));
      });
    }

    set(this, 'ary', ary);
    if (!ary.length) {
      this.send('add');
    }
  },

  actions: {
    add() {
      let ary = get(this, 'ary');

      ary.pushObject(EmberObject.create({
        key:  '',
        path: '',
        mode: ''
      }));

      next(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        let elem = $('INPUT.key').last()[0];

        if (elem) {
          elem.focus();
        }
      });
    },

    remove(obj) {
      get(this, 'ary').removeObject(obj);
    },
  },

  secretDidChange: observer('secretName', function() {
    if ( get(this, 'mode') === SECRET ) {
      this.updateSecretKeys();
      set(this, 'ary', []);
    }
  }),

  configMapDidChange: observer('configMapName', function() {
    if ( get(this, 'mode') === CONFIG_MAP ) {
      this.updateConfigMapKeys();
      set(this, 'ary', []);
    }
  }),

  aryObserver: on('init', observer('ary.@each.{key,path,mode}', function() {
    debounce(this, 'fireChanged', 100);
  })),

  // Secret
  updateSecretKeys() {
    const allSecrets = get(this, 'allSecrets');
    const secretName = get(this, 'secretName');

    set(this, 'keys', []);

    if (secretName) {
      const secret = allSecrets.findBy('name', secretName);

      if (secret) {
        set(this, 'keys', Object.keys(secret.data || {}).map((k) => ({
          label: k,
          value: k,
        })));
      }
    }
  },

  // Config Map
  updateConfigMapKeys() {
    const allConfigMaps = get(this, 'allConfigMaps');
    const configMapName = get(this, 'configMapName');

    set(this, 'keys', []);

    if (configMapName) {
      const configMap = allConfigMaps.findBy('name', configMapName);

      if (configMap && configMap.data) {
        set(this, 'keys', Object.keys(configMap.data).map((k) => ({
          label: k,
          value: k,
        })));
      }
    }
  },

  fireChanged() {
    if (this.isDestroyed || this.isDestroying) {
      return;
    }

    const arr = [];

    get(this, 'ary').forEach((row) => {
      const k = (row.get('key') || '').trim();
      const p = (row.get('path') || '').trim();
      const m = (row.get('mode') || '').trim();

      if (k && p) {
        if ( m ) {
          arr.push({
            key:  k,
            path: p,
            mode: parseInt(m, 8),
          });
        } else {
          arr.push({
            key:  k,
            path: p,
          });
        }
      }
    });

    if (this.changed) {
      this.changed(arr);
    }
  },
});
