import { get } from '@ember/object';
import { typeOf } from '@ember/utils';
import { isArray } from '@ember/array';
import Mixin from '@ember/object/mixin';

var Serializable = Mixin.create({
  serialize(depth) {
    depth = depth || 0;
    var output;

    if ( depth > 20 ) {
      return null;
    }

    if ( isArray(this) ) {
      output = this.map((item) => {
        return recurse(item, depth + 1);
      });
    } else {
      output = {};
      this.eachKeys((v, k) => {
        output[k] = recurse(v, depth + 1);
      });
    }

    return output;

    function recurse(obj, depth) {
      depth = depth || 0;
      if ( depth > 20 ) {
        return null;
      }

      if ( isArray(obj) ) {
        return obj.map((item) => {
          return recurse(item, depth + 1);
        });
      } else if ( Serializable.detect(obj) ) {
        return obj.serialize(depth);
      } else if ( obj && typeof obj === 'object' ) {
        var out = {};
        var keys = Object.keys(obj);

        keys.forEach((k) => {
          out[k] = recurse(obj[k], depth + 1);
        });

        return out;
      } else {
        return obj;
      }
    }
  },

  // Properties to ignore because they're built-in to ember, ember-debug, or the store
  concatenatedProperties: ['reservedKeys'],
  reservedKeys:           ['reservedKeys', 'constructor', 'container', 'store', 'isInstance', 'isDestroyed', 'isDestroying', 'concatenatedProperties', 'cache', 'factoryCache', 'validationCache', 'store'],

  allKeys() {
    var reserved = this.reservedKeys;

    var out = Object.keys(this).filter((k) => {
      return k.charAt(0) !== '_' &&
        reserved.indexOf(k) === -1 &&
        typeOf(get(this, k)) !== 'function';
    });

    return out;
  },

  eachKeys(fn) {
    var self = this;

    this.allKeys().forEach((k) => {
      fn.call(self, self.get(k), k);
    });
  },
});

export default Serializable;
