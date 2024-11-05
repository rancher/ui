import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import fetch from 'ember-api-store/utils/fetch';

export default Controller.extend({
  settings: service(),

  emailSent:    false,
  saving:       false,
  saveDisabled: true,
  actions:      {
    register() {
      this.set('saving', true);

      fetch('/register-new', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(this.model)
      }).then(() => {
        this.set('saving', false);
        this.set('emailSent', true);
      })
        .catch((err) => {
          if (err.status === 409) {
            this.set('showReset', true);
          }
          this.set('saving', false);
          this.set('errors', [err.body.detail]);
        });
    },
    cancel() {
      if (this.errors) {
        this.set('errors', []);
      }
      this.transitionToRoute('login');
    }
  },
  validate:     observer('model.name', 'model.email', function() {
    if (this.get('model.name') && this.get('model.email')) {
      if (this.errors) {
        this.set('errors', []);
      }
      this.set('saveDisabled', false);
    } else {
      this.set('saveDisabled', true);
    }
  }),
});
