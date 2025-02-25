import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { get, set, computed, defineProperty } from '@ember/object';
import { inject as service } from '@ember/service';
import { ucFirst } from 'shared/utils/util';
import { getDisplayLocation, getDisplaySize } from 'shared/mixins/node-driver';
import { isArray } from '@ember/array';

export default Resource.extend({
  intl:         service(),
  modalService: service('modal'),
  globalStore:  service(),

  type:                   'nodeTemplate',
  canClone:               true,
  dynamicComputedKeyName: null,

  creator: reference('creatorId', 'user', 'globalStore'),

  init() {
    this._super(...arguments);

    const { driver } = this;

    if (driver) {
      this.initDisplayLocation(driver);
      this.initDisplaySize(driver);
    }
  },

  config: computed('driver', function() {
    const driver = this.driver;

    return get(this, `${ driver }Config`);
  }),

  displayProvider: computed('driver', 'intl.locale', function() {
    const intl = this.intl;
    const driver = this.driver;
    const key = `nodeDriver.displayName.${ driver }`;

    if ( intl.exists(key) ) {
      return intl.t(key);
    } else {
      return ucFirst(driver);
    }
  }),

  cloneForNew() {
    const copy = this._super();

    delete copy.annotations;

    return copy;
  },

  actions: {
    edit() {
      let driver = this.driver;

      this.modalService.toggleModal('modal-edit-node-template', {
        driver,
        config:       get(this, `${ driver }Config`),
        nodeTemplate: this,
        edit:         true,
      });
    },

    clone() {
      const { driver } = this;

      this.modalService.toggleModal('modal-edit-node-template', {
        driver,
        config:       get(this, `${ driver }Config`),
        nodeTemplate: this,
        clone:        true,
      });
    }
  },

  _displayVar(keyOrFn) {
    const intl = this.intl;

    if ( keyOrFn ) {
      if ( typeof (keyOrFn) === 'function' ) {
        return keyOrFn.call(this);
      }  else {
        return get(this, keyOrFn) || intl.t('generic.unknown');
      }
    } else {
      return intl.t('generic.unknown');
    }
  },

  clearConfigsExcept(keep) {
    const keys = this.allKeys().filter((x) => x.endsWith('Config'));

    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( key !== keep && get(this, key) ) {
        set(this, key, null);
      }
    }
  },

  initDisplayLocation(driver) {
    let location     = getDisplayLocation(driver);
    let computedKeys = null;

    if (location && location.keyOrKeysToWatch) {
      computedKeys = isArray(location.keyOrKeysToWatch) ? location.keyOrKeysToWatch : [location.keyOrKeysToWatch];

      this.registerDynamicComputedProperty('displayLocation', computedKeys, location.getDisplayProperty);
    } else {
      set(this, 'displayLocation', get(this, 'config.region') || 'N/A');
    }
  },

  initDisplaySize(driver) {
    let size     = getDisplaySize(driver);
    let computedKeys = null;

    if (size && size.keyOrKeysToWatch) {
      computedKeys = isArray(size.keyOrKeysToWatch) ? size.keyOrKeysToWatch : [size.keyOrKeysToWatch];

      this.registerDynamicComputedProperty('displaySize', computedKeys, size.getDisplayProperty);
    } else {
      set(this, 'displaySize', get(this, 'config.size') || 'N/A');
    }
  },

  registerDynamicComputedProperty(propertyName, watchedKeys, key) {
    defineProperty(this, propertyName, computed(...watchedKeys, function() {
      return this._displayVar(key);
    }));
  },
});
