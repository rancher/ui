import { resolve, reject } from 'rsvp';
import { observer } from '@ember/object';
import { on } from '@ember/object/evented';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { get } from '@ember/object';

export default Service.extend({
  cookies: service(),
  session: service(),
  github:  service(),
  shibbolethAuth: service(),
  globalStore: service(),

  token: null,
  loadedVersion: null,

  // These are set by authenticated/route
  // Is access control enabled
  enabled: true, // @TODO-2.0 remove this, always enabled

  // What kind of access control
  provider: null,

  // Are you an admin
  admin: null,

  // The identity from the session isn't an actual identity model...
  identity: null,
  identityObsvr: on('init', observer(`session.${C.SESSION.IDENTITY}`, function() {
    var obj = this.get(`session.${C.SESSION.IDENTITY}`) || {};
    obj.type = 'identity';
    this.set('identity', this.get('globalStore').createRecord(obj));
  })),

  testAuth() {
    // make a call to api base because it is authenticated
    return this.get('globalStore').rawRequest({
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
      return resolve('Auth Succeeded');
    }, (/* err */) => {
      // Auth token expired
      return reject('Auth Failed');
    });
  },

  detect() {
    if ( this.get('enabled') !== null ) {
      return resolve();
    }

    return this.get('globalStore').rawRequest({
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

      return resolve(undefined,'API supports authentication'+(token.security ? '' : ', but is not enabled'));
    })
    .catch((err) => {
      // Otherwise this API is too old to do auth.
      this.set('enabled', false);
      this.set('app.initError', err);
      return resolve(undefined,'Error determining API authentication');
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
    return this.get('globalStore').rawRequest({
      url: 'tokens?action=login',
      method: 'POST',
      data: code,
    }).then(() => {
      return this.get('globalStore').rawRequest({
        url: 'users/admin', // TODO 2.0 need to get exact user on collection
        method: 'GET',
      }).then((user) => {
        this.set('admin', true); // TODO 2.0 super user
        return user.body;
      }).catch((res) => {
        let err;
        try {
          err = res.body;
        } catch(e) {
          err = {type: 'error', message: 'Error logging in'};
        }
        return reject(err);
      });
    }).catch((res) => {
      let err;
      try {
        err = res.body;
      } catch(e) {
        err = {type: 'error', message: 'Error logging in'};
      }
      return reject(err);
    });
  },

  clearToken() {

    // @TODO-2.0
    return this.get('globalStore').rawRequest({
      url: 'tokens?action=logout',
      method: 'POST',
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
    // @TODO-2.0
    return true;
  }
});
