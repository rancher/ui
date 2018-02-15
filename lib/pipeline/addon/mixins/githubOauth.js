import Mixin from '@ember/object/mixin';

export default Mixin.create({
  actions: {
    gotCode: function(code, app, oauthModel, cb) {
      app.doAction('auth', oauthModel).then(() => {
        cb();
      }).catch(res => {
        // Github auth succeeded but didn't get back a token
        this.send('gotError', res);
      });
    },
    gotError: function(err) {
      if (err.message) {
        this.send('showError', err.message + (err.detail ? '(' + err.detail + ')' : ''));
      } else {
        this.send('showError', 'Error (' + err.status + ' - ' + err.code + ')');
      }

      this.set('testing', false);
    },

    showError: function(msg) {
      this.set('errors', [msg]);
      window.scrollY = 10000;
    },

    clearError: function() {
      this.set('errors', null);
    },
  }
});
