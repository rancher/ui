import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  cookies: Ember.inject.service(),
  session: Ember.inject.service(),
  github:  Ember.inject.service(),
  shibbolethAuth: Ember.inject.service(),
  store: Ember.inject.service(),
  userStore: Ember.inject.service('user-store'),

  token: null,
  loadedVersion: null,

  // These are set by authenticated/route
  // Is access control enabled
  enabled: null,

  // What kind of access control
  provider: null,

  // Are you an admin
  admin: null,

  // The identity from the session isn't an actual identity model...
  identity: null,
  identityObsvr: Ember.on('init', Ember.observer(`session.${C.SESSION.IDENTITY}`, function() {
    var obj = this.get(`session.${C.SESSION.IDENTITY}`) || {};
    obj.type = 'identity';
    this.set('identity', this.get('userStore').createRecord(obj));
  })),

  testAuth() {
    // make a call to api base because it is authenticated
    return this.get('userStore').rawRequest({
      url: '',
    }).then((xhr) => {
      let loaded = this.get('loadedVersion');
      let cur = xhr.headers.get(C.HEADER.RANCHER_VERSION);

      // Reload if the version changes
      if ( loaded && cur && loaded !== cur ) {
        window.location.href = window.location.href;
        return;
      }

      // Auth token still good
      return Ember.RSVP.resolve('Auth Succeeded');
    }, (/* err */) => {
      // Auth token expired
      return Ember.RSVP.reject('Auth Failed');
    });
  },

  detect() {
    if ( this.get('enabled') !== null ) {
      return Ember.RSVP.resolve();
    }

    return this.get('userStore').rawRequest({
      url: 'token',
    })
    .then((xhr) => {
      // If we get a good response back, the API supports authentication
      var token = xhr.body.data[0];

      this.setProperties({
        'enabled': token.security,
        'provider': (token.authProvider||'').toLowerCase(),
        'loadedVersion': xhr.headers.get(C.HEADER.RANCHER_VERSION),
      });

      this.set('token', token);

      if (this.shibbolethConfigured(token)) {
        this.get('shibbolethAuth').set('hasToken', token);
        this.get('session').set(C.SESSION.USER_TYPE, token.userType);
      } else if ( !token.security ) {
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

  shibbolethConfigured(token) {
    let rv = false;
    if ((token.authProvider||'') === 'shibbolethconfig' && token.userIdentity) {
      rv = true;
    }
    return rv;
  },

  login(code) {
    var session = this.get('session');

    return this.get('userStore').rawRequest({
      url: 'token',
      method: 'POST',
      data: {
        code: code,
        authProvider: this.get('provider'),
      },
    }).then((xhr) => {
      var auth = xhr.body;
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
      return xhr;
    }).catch((res) => {
      let err;
      try {
        err = res.body;
      } catch(e) {
        err = {type: 'error', message: 'Error logging in'};
      }
      return Ember.RSVP.reject(err);
    });
  },

  clearToken() {
    return this.get('userStore').rawRequest({
      url: 'token/current',
      method: 'DELETE',
    }).then(() => {
      return true;
    });
  },

  clearSessionKeys(all) {
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

  isLoggedIn() {
    return !!this.get('cookies').get(C.COOKIE.TOKEN);
  },

  isOwner() {
    let schema = this.get('store').getById('schema','stack');
    if ( schema && schema.resourceFields.system ) {
      return schema.resourceFields.system.create;
    }

    return false;
  }
});
