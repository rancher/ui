import Resource from 'ember-api-store/models/resource';
import {
  get, set, computed
} from '@ember/object';
import { inject as service } from '@ember/service';
import { ucFirst } from 'shared/utils/util';
import { getDisplayLocation, getDisplaySize } from 'shared/mixins/node-driver';

export default Resource.extend({


  config: computed('driver', function() {

    const driver = get(this, 'driver');

    return get(this, `${ driver }Config`);

  }),

  displayProvider: computed('driver', 'intl.locale', function() {

    const intl = get(this, 'intl');
    const driver = get(this, 'driver');
    const key = `nodeDriver.displayName.${ driver }`;

    if ( intl.exists(key) ) {

      return intl.t(key);

    } else {

      return ucFirst(driver);

    }

  }),

  displaySize: computed('config', function() {

    const driver = get(this, 'driver');

    return this._displayVar(getDisplaySize(driver));

  }).volatile(),

  displayLocation: computed(function() {

    const driver = get(this, 'driver');

    return this._displayVar(getDisplayLocation(driver));

  }).volatile(),

  intl:         service(),
  modalService: service('modal'),

  type:         'nodeTemplate',
  canClone:     true,

  actions: {
    edit() {

      let driver = get(this, 'driver');

      get(this, 'modalService').toggleModal('modal-edit-node-template', {
        driver,
        config:       get(this, `${ driver }Config`),
        nodeTemplate: this,
      });

    },

    clone() {

      const clone  = this.cloneForNew();
      const driver = get(this, 'driver');

      get(this, 'modalService').toggleModal('modal-edit-node-template', {
        driver,
        config:       get(this, `${ driver }Config`),
        nodeTemplate: clone,
      });

    }
  },

  _displayVar(keyOrFn) {

    const intl = get(this, 'intl');

    if ( keyOrFn ) {

      if ( typeof (keyOrFn) === 'function' ) {

        return keyOrFn.call(this);

      } else {

        return get(this, keyOrFn);

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
});
