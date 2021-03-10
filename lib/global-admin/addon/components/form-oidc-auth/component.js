import Component from '@ember/component';
import { computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { stripScheme } from 'shared/utils/util';
import layout from './template';

export default Component.extend({
  settings: service(),
  layout,

  authConfig:                 null,
  endpointSelection:          'standard',
  urlError:                   null,
  issuerUrlInvalid:           false,
  issuerUrlWarning:           false,
  authEndpointUrlWarning:     false,
  authEndpointUrlInvalid:     false,
  tokenEndpointUrlInvalid:    false,
  tokenEndpointUrlWarning:    false,
  userInfoEndpointUrlInvalid: false,
  userInfoEndpointUrlWarning: false,
  protocol:                   'http://', // https


  authEndpoint: computed('authConfig.authEndpoint', {
    get() {
      return this.authConfig?.authEndpoint ? stripScheme(this.authConfig.authEndpoint) : null;
    },
    set(_key, neu) {
      set(this, 'authConfig.authEndpoint', `${ this.protocol }${ neu }`);

      return neu;
    }
  }),

  issuer: computed('authConfig.issuer', {
    get() {
      return this.authConfig?.issuer ? stripScheme(this.authConfig.issuer) : null;
    },
    set(_key, neu) {
      set(this, 'authConfig.issuer', `${ this.protocol }${ neu }`);

      return neu;
    }
  }),

  tokenEndpoint: computed('authConfig.tokenEndpoint', {
    get() {
      return this.authConfig?.tokenEndpoint ? stripScheme(this.authConfig.tokenEndpoint) : null;
    },
    set(_key, neu) {
      set(this, 'authConfig.tokenEndpoint', `${ this.protocol }${ neu }`);

      return neu;
    }
  }),

  userInfoEndpoint: computed('authConfig.userInfoEndpoint', {
    get() {
      return this.authConfig?.userInfoEndpoint ? stripScheme(this.authConfig.userInfoEndpoint) : null;
    },
    set(_key, neu) {
      set(this, 'authConfig.userInfoEndpoint', `${ this.protocol }${ neu }`);

      return neu;
    }
  }),
});
