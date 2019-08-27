import Component from '@ember/component';
import { get, computed } from '@ember/object';
import layout from './template';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  layout,

  buttonDisabled: computed('authConfig.hostname', 'authConfig.adminEmail', 'authConfig.serviceAccountCredential', 'authConfig.oauthCredential', function() {
    const authConfig          = get(this, 'authConfig');
    const isHostnameEmpty     = isEmpty(authConfig.get('hostname'))
    const isAdminEmailEmpty   = isEmpty(authConfig.get('adminEmail'))

    if (!get(this, 'authConfig.oauthCredential') || !get(this, 'authConfig.serviceAccountCredential') || isHostnameEmpty || isAdminEmailEmpty) {
      return true
    }

    return false
  }),

  destinationUrl: computed(() => {
    return `${ window.location.origin }/`;
  }),

  destinationDomain: computed(() => {
    return `${ window.location.hostname }`;
  }),

  redirectURI: computed(() => {
    return `${ window.location.origin }/verify-auth`;
  }),

  authorizedJavascriptOrigin: computed(() => {
    return `${ window.location.origin }`;
  }),
});
