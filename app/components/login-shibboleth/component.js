import Ember from 'ember';

export default Ember.Component.extend({
  redirectUrl: null,
  shibbolethAuth: Ember.inject.service(),
  outRoute: null,
  init: function() {
    this._super(...arguments);
    this.set('outRoute', window.location.origin);
  },
  actions: {
    authenticate() {
      this.sendAction('action');
      Ember.run.later(() => {
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
