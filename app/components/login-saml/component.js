import Ember from 'ember';

export default Ember.Component.extend({
  redirectUrl: null,
  samlAuth: Ember.inject.service(),
  actions: {
    authenticate() {
      this.sendAction('action');
      Ember.run.later(() => {
        this.authSAML();
      }, 10);
    }
  },
  authSAML: function() {
    this.get('samlAuth').getToken().then((token) => {
      let samlAuth = this.get('samlAuth');
      samlAuth.authorizeRedirect(samlAuth.buildRedirectUrl(token.redirectUrl));
    });
  },
});
