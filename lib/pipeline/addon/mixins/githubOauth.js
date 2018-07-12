import Mixin from '@ember/object/mixin';
import { set } from '@ember/object';

export default Mixin.create({
  actions: {
    gotCode(code, app, oauthModel, cb) {

      app.doAction('auth', oauthModel).then(() => {

        cb();

      })
        .catch((res) => {

        // Github auth succeeded but didn't get back a token
          this.send('gotError', res);

        });

    },
    gotError(err) {

      if (err.message) {

        this.send('showError', err.message + (err.detail ? `(${  err.detail  })` : ''));

      } else {

        this.send('showError', `Error (${  err.status  } - ${  err.code  })`);

      }

      set(this, 'testing', false);

    },

    showError(msg) {

      set(this, 'errors', [msg]);
      window.scrollY = 10000;

    },

    clearError() {

      set(this, 'errors', null);

    },
  }
});
