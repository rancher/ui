import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import fetch from 'ember-api-store/utils/fetch';

export default Controller.extend({
  access:         service(),
  accountCreated: false,
  loading:        false,
  canSend:        false,

  actions: {
    createAcct() {
      var body   = this.model;

      body.token = this.token;

      this.set('loading', true);

      fetch('/create-user', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      }).then(() => {
        let code = `${ body.email }:${ body.pw }`;

        this.access.login(code)
          .then(() => {
            this.transitionToRoute('authenticated')
            this.set('loading', false);
          })
          .catch((err) => {
            this.set('saving', false);
            this.set('errors', [err.body.detail]);
          });
      })
        .catch((err) => {
          this.set('saving', false);
          this.set('errors', [err.body.detail]);
        });
    },
  }
});
