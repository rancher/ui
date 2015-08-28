import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  cookies: Ember.inject.service(),
  session: Ember.inject.service(),
  github:  Ember.inject.service(),
  identity: Ember.computed.alias('session.'+C.SESSION.IDENTITY),

  // These are set by authenticated/route
  // Is access control enabled
  enabled: null,

  // What kind of access control
  provider: null,

  // Are you an admin
  admin: null,

  detect: function() {
    return this.get('store').rawRequest({
      url: 'token',
      headers: {
        [C.HEADER.PROJECT]: undefined
      }
    })
    .then((obj) => {
      // If we get a good response back, the API supports authentication
      var body = JSON.parse(obj.xhr.responseText);
      var token = body.data[0];

      this.setProperties({
        'enabled': token.security,
        'provider': token.authProvider||'',
      });

      if ( (token.authProvider||'').toLowerCase() === 'githubconfig' )
      {
        this.setProperties({
          'github.clientId': token.clientId,
          'github.hostname': token.hostname,
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

    var headers = {};
    headers[C.HEADER.PROJECT] = undefined; // Explictly not send project

    return this.get('store').rawRequest({
      url: 'token',
      method: 'POST',
      headers: headers,
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

      this.get('cookies').set(C.COOKIE.TOKEN, auth['jwt'], {
        path: '/',
        secure: window.location.protocol === 'https:'
      });

      session.setProperties(interesting);
      return res;
    }).catch((res) => {
      var err = JSON.parse(res.xhr.responseText);
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
