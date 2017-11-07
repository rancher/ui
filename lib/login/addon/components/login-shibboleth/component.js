import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  redirectUrl: null,
  shibbolethAuth: service(),
  outRoute: null,
  init: function() {
    this._super(...arguments);
    this.set('outRoute', window.location.origin);
  },
  actions: {
    authenticate() {
      this.sendAction('action');
      later(() => {
        this.authShibboleth();
      }, 10);
    }
  },
  authShibboleth: function() {
    this.get('shibbolethAuth').getToken().then((token) => {
      let shibbolethAuth = this.get('shibbolethAuth');
      shibbolethAuth.authorizeRedirect(shibbolethAuth.buildRedirectUrl(token.redirectUrl));
    });
  },
});
