import { get, computed } from '@ember/object';
import { alias } from '@ember/object/computed'
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';

export const PRESETS = {
  'index.docker.io':                              'dockerhub',
  'quay.io':                                      'quay',
  [window.location.host]:                          window.location.host,
}

export const PRESETS_BY_NAME = {};
Object.keys(PRESETS).forEach((key) => {
  PRESETS_BY_NAME[ PRESETS[key] ] = key;
});

var DockerCredential = Resource.extend({
  intl:     service(),
  router:   service(),

  state:    'active',
  canClone: true,

  firstRegistry: alias('asArray.firstObject'),
  registryCount: alias('asArray.length'),

  asArray: computed('registries', function() {
    const all = this.registries || {};

    let reg, address, preset;

    return Object.keys(all).map((key) => {
      address = key.toLowerCase();
      reg = all[key];
      preset = PRESETS[address] || 'custom';

      return {
        address,
        auth:     reg.auth,
        username: reg.username,
        password: reg.password,
        preset
      };
    });
  }),

  searchAddresses: computed('asArray.@each.address', function() {
    return this.asArray.map((x) => get(x, 'address'))
      .sort()
      .uniq();
  }),

  searchUsernames: computed('asArray.@each.username', function() {
    return this.asArray.map((x) => get(x, 'username'))
      .sort()
      .uniq();
  }),

  displayAddress: computed('intl.locale', 'registryCount', 'firstRegistry.address', function() {
    const address = get(this, 'firstRegistry.address');

    if ( this.registryCount > 1 ) {
      return 'cruRegistry.multiple';
    } else if (address === window.location.host) {
      return address;
    } else if ( PRESETS[address] ) {
      return this.intl.t(`cruRegistry.address.${  PRESETS[address] }`);
    } else {
      return address;
    }
  }),

  displayUsername: computed('registryCount', 'firstRegistry.username', function() {
    const intl = this.intl;
    const username = get(this, 'firstRegistry.username');

    if ( this.registryCount > 1 ) {
      return intl.t('cruRegistry.multiple');
    } else {
      return username;
    }
  }),
  actions: {
    clone() {
      this.router.transitionTo('authenticated.project.registries.new', {
        queryParams: {
          id:   this.id,
          type: this.type
        }
      });
    }
  },

});

export default DockerCredential;
