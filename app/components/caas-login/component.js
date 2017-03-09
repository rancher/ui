import Ember from 'ember';
import fetch from 'ember-api-store/utils/fetch';

export default Ember.Component.extend({
  classNames: ['caas-login', 'text-left'],
  showReset: Ember.computed.alias('promptReset'),
  userEmail: null,
  passwordResetSent: false,
  showSuccess: false,
  intl: Ember.inject.service(),
  actions: {
    toggleReset: function(e) {
      e.preventDefault();
      this.toggleProperty('showReset');
    },
    cancel: function() {
      this.setProperties({
        errMsg: null,
        showReset: false,
        showSuccess: false,
      });
    },
    resetPw: function() {
      this.set('loading', true);
      fetch('/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: this.get('userEmail')})
      }).then(() => {
        this.set('loading', false);
        this.set('showSuccess', true);
      }).catch(() => {
        this.set('errMsg', this.get('intl').t('caasLogin.error'));
        this.set('loading', false);
      });
    }
  }
});
