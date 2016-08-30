import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  cookies: Ember.inject.service(),
  session: Ember.inject.service(),
  github:  Ember.inject.service(),

  testAuth: function() {

    // make a call to v1 because it is authenticated
    return this.get('userStore').rawRequest({
      url: '',
    }).then((/* res */) => {
      // Auth token still good
      return Ember.RSVP.resolve('Auth Succeeded');
    }, (/* err */) => {
      // Auth token expired
      return Ember.RSVP.reject('Auth Failed');
    });
  },

  // The identity from the session isn't an actual identity model...
  identity: function() {
    var obj = this.get('session.'+C.SESSION.IDENTITY) || {};
    obj.type = 'identity';
    return this.get('userStore').createRecord(obj);
  }.property('session.'+C.SESSION.IDENTITY),

  // These are set by authenticated/route
  // Is access control enabled
  enabled: null,

  // What kind of access control
  provider: null,

  // Are you an admin
  admin: null,

  detect: function() {
    if ( this.get('enabled') !== null ) {
      return Ember.RSVP.resolve();
    }

    return this.get('userStore').rawRequest({
      url: 'token',
    })
    .then((obj) => {
      // If we get a good response back, the API supports authentication
      var body = JSON.parse(obj.xhr.responseText);
      var token = body.data[0];

      this.setProperties({
        'enabled': token.security,
        'provider': (token.authProvider||'').toLowerCase(),
      });

      if ( (token.authProvider||'').toLowerCase() === 'githubconfig' )
      {
        this.setProperties({
          'github.clientId': token.clientId,
          'github.hostname': token.hostname,
          'github.scheme': token.scheme || 'https://',
        });
      }

      if ( !token.security )
      {
        this.clearSessionKeys();
      }

      return Ember.RSVP.resolve(undefined,'API supports authentication'+(token.security ? '' : ', but is not enabled'));
    })
    .catch((err) => {
      // Otherwise this API is too old to do auth.
      this.set('enabled', false);
      this.set('app.initError', err);
      return Ember.RSVP.resolve(undefined,'Error determining API authentication');
    });
  },

  login: function(code) {
    var session = this.get('session');

    return this.get('userStore').rawRequest({
      url: 'token',
      method: 'POST',
      data: {
        code: code,
        authProvider: this.get('provider'),
      },
    }).then((res) => {
      var auth = JSON.parse(res.xhr.responseText);
      var interesting = {};
      C.TOKEN_TO_SESSION_KEYS.forEach((key) => {
        if ( typeof auth[key] !== 'undefined' )
        {
          interesting[key] = auth[key];
        }
      });

      this.get('cookies').setWithOptions(C.COOKIE.TOKEN, auth['jwt'], {
        path: '/',
        secure: window.location.protocol === 'https:'
      });

      session.setProperties(interesting);
      return res;
    }).catch((res) => {
      let err;
      try {
        err = JSON.parse(res.xhr.responseText);
      } catch(e) {
        err = {type: 'error', message: 'Error logging in'};
      }
      return Ember.RSVP.reject(err);
    });
  },

  clearSessionKeys: function(all) {
    if ( all === true )
    {
      this.get('session').clear();
    }
    else
    {
      var values = {};
      C.TOKEN_TO_SESSION_KEYS.forEach((key) => {
        values[key] = undefined;
      });

      this.get('session').setProperties(values);
    }

    this.get('cookies').remove(C.COOKIE.TOKEN);
  },

  isLoggedIn: function() {
    return !!this.get('cookies').get(C.COOKIE.TOKEN);
  },
});
