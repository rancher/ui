import { on } from '@ember/object/evented';
import { next, debounce } from '@ember/runloop';
import Component from '@ember/component';
import EmberObject, { get, set, observer } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,
  // Inputs
  initialItems: null,
  secretId: null,

  editing: true,
  ary: null,
  keys: null,
  allSecrets: null,

  actions: {
    add() {
      let ary = get(this, 'ary');
      ary.pushObject(EmberObject.create({ key: '', path: '', mode: '' }));

      next(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        let elem = this.$('INPUT.key').last()[0];
        if (elem) {
          elem.focus();
        }
      });
    },

    remove(obj) {
      get(this, 'ary').removeObject(obj);
    },
  },

  init() {
    this._super(...arguments);

    const ary = [];
    const items = get(this, 'initialItems');

    const allSecrets = get(this, 'store').all('secret');
    set(this, 'allSecrets', allSecrets);
    this.updateSecretKeys();

    if (items) {
      items.forEach((item) => {
        ary.push(EmberObject.create({
          key: item.key,
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

  updateSecretKeys: function() {
    const allSecrets = get(this, 'allSecrets');
    const secretId = get(this, 'secretId');
    if (secretId) {
      const secret = allSecrets.findBy('id', secretId);
      set(this, 'keys', Object.keys(secret.data).map(k => {
        return {
          label: k,
          value: k,
        }
      }));
    } else {
      set(this, 'keys', []);
    }
  },

  secretDidChange: observer('secretId', function() {
    this.updateSecretKeys();
    set(this, 'ary', []);
  }),

  aryObserver: on('init', observer('ary.@each.{key,path,mode}', function () {
    debounce(this, 'fireChanged', 100);
  })),

  fireChanged() {
    if (this.isDestroyed || this.isDestroying) {
      return;
    }

    const arr = [];

    get(this, 'ary').forEach((row) => {
      const k = (row.get('key')||'').trim();
      const p = (row.get('path')||'').trim();
      const m = (row.get('mode')||'').trim();

      if (k && p) {
        if ( m ) {
          arr.push({
            key: k,
            path: p,
            mode: parseInt(m,8),
          });
        } else {
          arr.push({
            key: k,
            path: p,
          });
        }
      }
    });

    this.sendAction('changed', arr);
  },
});
