import Ember from 'ember';

export default Ember.Controller.extend({
  access            : Ember.inject.service(),
  settings          : Ember.inject.service(),
  intl              : Ember.inject.service(),

  confirmDisable    : false,
  errors            : null,
  testing           : false,
  error             : null,

  loginUsername     : null,
  loginPassword     : null,

  actions: {
    test: function() {
      this.send('clearError');

      var model = this.get('model');
      model.setProperties({
        enabled: false,
      });

      var errors = model.validationErrors();
      if ( errors.get('length') )
      {
        this.set('errors', errors);
      }
      else
      {
        this.set('testing', true);
        model.save().then(() => {
          this.send('authenticate');
        }).catch(err => {
          this.send('gotError', err);
        });
      }
    },

    authenticate: function() {
      this.send('clearError');
      var code = this.get('loginUsername')+':'+this.get('loginPassword');
      this.get('access').login(code).then(res => {
        this.send('authenticationSucceeded', res.body);
      }).catch(err => {
        this.send('gotError', err);
      });
    },

    authenticationSucceeded: function(/*auth*/) {
      this.send('clearError');

      // Set this to true so the token will be sent with the request
      this.set('access.enabled', true);

      var model = this.get('model');
      model.setProperties({
        enabled: true,
      });

      model.save().then(() => {
        this.send('waitAndRefresh');
      }).catch((err) => {
        this.set('access.enabled', false);
        this.send('gotError', err);
      });
    },

    waitAndRefresh: function(url) {
      $('#loading-underlay, #loading-overlay').removeClass('hide').show();
      setTimeout(function() {
        window.location.href = url || window.location.href;
      }, 1000);
    },

    promptDisable: function() {
      this.set('confirmDisable', true);
      Ember.run.later(this, function() {
        this.set('confirmDisable', false);
      }, 10000);
    },

    gotError: function(err) {
      if ( err.message )
      {
        this.send('showError', err.message + (err.detail? '('+err.detail+')' : ''));
      }
      else
      {
        this.send('showError', 'Error ('+err.status + ' - ' + err.code+')');
      }

      this.set('testing', false);
      this.set('saving', false);
    },

    showError: function(msg) {
      this.set('errors', [msg]);
      window.scrollY = 0;
    },

    clearError: function() {
      this.set('errors', null);
    },

    disable: function() {
      this.send('clearError');

      var model = this.get('model');
      model.setProperties({
        enabled: false,
        username: "",
        password: "",
      });

      model.save().then(() => {
        this.get('access').clearSessionKeys();
        this.set('access.enabled',false);
        this.send('waitAndRefresh');
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        this.set('confirmDisable', false);
      });
    },
  },

  headerText: Ember.computed('access.enabled', 'intl._locale', function() {
    let out = this.get('intl').findTranslationByKey('authPage.azuread.header.disabled');
    if (this.get('access.enabled')) {
      out = this.get('intl').findTranslationByKey('authPage.azuread.header.enabled');

    }
    return this.get('intl').formatHtmlMessage(out);
  }),
});
