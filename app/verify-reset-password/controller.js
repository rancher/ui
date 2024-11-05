import Controller from '@ember/controller';
import fetch from 'ember-api-store/utils/fetch';

export default Controller.extend({
  passwordRest: false,
  loading:      false,
  password:     null,
  canSend:      false,
  actions:      {
    resetPassword() {
      var body = this.model;

      body.token = this.token;
      body.pw = this.password;
      this.set('loading', true);
      fetch('/update-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      }).then(() => {
        this.set('loading', false);
        window.location.href = '/';
      })
        .catch((err) => {
          this.set('loading', false);
          this.set('errors', [err.body.detail]);
        });
    }
  },
});
