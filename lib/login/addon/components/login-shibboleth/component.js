import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  shibbolethAuth: service(),
  redirectUrl:    null,
  outRoute:       null,
  init() {
    this._super(...arguments);
    this.set('outRoute', window.location.origin);
  },
  actions: {
    authenticate() {
      if (this.action) {
        this.action();
      }

      later(() => {
        this.authShibboleth();
      }, 10);
    }
  },
  authShibboleth() {
    this.get('shibbolethAuth').getToken().then((token) => {
      let shibbolethAuth = this.get('shibbolethAuth');

      shibbolethAuth.authorizeRedirect(shibbolethAuth.buildRedirectUrl(token.redirectUrl));
    });
  },
});
