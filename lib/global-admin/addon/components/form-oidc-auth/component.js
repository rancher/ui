import Component from '@ember/component';
import { observer, setProperties } from '@ember/object';
import { on } from '@ember/object/evented';
import { debounce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import layout from './template';

export default Component.extend({
  settings: service(),
  layout,

  authConfig:        null,
  oidcRealm:         null,
  oidcHost:          null,
  endpointSelection: 'standard',
  urlError:          null,
  urlWarning:        false,
  urlInvalid:        false,
  protocol:          'https://', // http

  hostOrRealmChanged: on('init', observer('authConfig', 'endpointSelection', 'oidcRealm', 'oidcHost', function() {
    debounce(this, 'parsePaths', 150);
  })),

  parsePaths() {
    const {
      authConfig, oidcRealm, oidcHost, protocol
    } = this;

    if (isEmpty(oidcRealm) || isEmpty(oidcHost) || isEmpty(authConfig)) {
      return;
    }

    const standardPath = `${ protocol }${ oidcHost }/auth/realms/${ oidcRealm }/protocol/openid-connect`;

    setProperties(this.authConfig, {
      authEndpoint:     `${ standardPath }/auth`,
      tokenEndpoint:    `${ standardPath }/token`,
      userInfoEndpoint: `${ standardPath }/userinfo`,
    });
  },
});
