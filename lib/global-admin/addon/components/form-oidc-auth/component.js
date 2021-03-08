import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  settings: service(),
  layout,

  authConfig:                 null,
  oidcRealm:                  null,
  oidcHost:                   null,
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
  protocol:                   'https://', // http
});
