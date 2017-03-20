import Ember from 'ember';
import fetch from 'ember-api-store/utils/fetch';

export default Ember.Controller.extend({
  accountCreated: false,
  loading: false,
  canSend: false,
  actions: {
    createAcct: function() {
      var body = this.get('model');
      body.token = this.get('token');

      this.set('loading', true);

      fetch('/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then(() => {
        this.set('loading', false);
        window.location.href = '/';
      }).catch((err) => {
        this.set('saving', false);
        this.set('errors', [err.body.detail]);
      });
    },
  }
});
