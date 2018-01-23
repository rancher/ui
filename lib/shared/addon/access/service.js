import { resolve, reject } from 'rsvp';
import { observer } from '@ember/object';
import { on } from '@ember/object/evented';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import {  get, set } from '@ember/object';
import { isArray } from '@ember/array';

export default Service.extend({
  cookies: service(),
  session: service(),
  github:  service(),
  shibbolethAuth: service(),
  globalStore: service(),
  clusterStore: service(),
  projectStore: service('store'),
  app: service(),

  token: null,
  loadedVersion: null,
  me: null,

  // These are set by authenticated/route
  // Is access control enabled
  enabled: true, // @TODO-2.0 remove this, always enabled

  // What kind of access control
  provider: 'local',  // @TODO-2.0 remove this, and how do i check?

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
    }).then((/*xhr*/) => {
//      let loaded = this.get('loadedVersion');
//      let cur = xhr.headers.get(C.HEADER.RANCHER_VERSION);

      // Reload if the version changes
//      if ( loaded && cur && loaded !== cur ) {
//        window.location.href = window.location.href;
//        return;
//      }

      // Auth token still good
      return resolve('Auth Succeeded');
    }, (/* err */) => {
      // Auth token expired
      return reject('Auth Failed');
    });
  },

  detect() {
    return this.get('globalStore').request({
      url: 'users?me=true',
    })
    .then((users) => {
      if ( get(users, 'length') ) {
        set(this, 'me', get(users,'firstObject'));
      }

      set(this, 'admin', true); // TODO-2.0 always admin for now, this variable should go away
      return resolve(undefined, `API supports authentication`);

      // // If we get a good response back, the API supports authentication
      // var token = xhr.body.data[0];

      // this.setProperties({
      //   'provider': 'local', // TODO 2.0
      //   'loadedVersion': xhr.headers.get(C.HEADER.RANCHER_VERSION), // TODO 2.0 do we still need the version?
      // });

      // this.set('token', token);

      // if (this.shibbolethConfigured(token)) {
      //   this.get('shibbolethAuth').set('hasToken', token);
      //   this.get('session').set(C.SESSION.USER_TYPE, token.userType);
      // } else if ( !token.security ) {
      //   this.clearSessionKeys();
      // }

      // return resolve(undefined,'API supports authentication'+(token.security ? '' : ', but is not enabled'));
    })
    .catch((err) => {
      // Otherwise this API is too old to do auth, or something else went wrong since that's impossible in 2.0
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

  login(body) {
    body.description = 'UI Session';
    body.responseType = 'cookie';
    body.ttl = 16*60*60*1000;
    body.labels = {
      'ui-session': 'true',
    };

    return this.get('globalStore').rawRequest({
      url: 'tokens?action=login',
      method: 'POST',
      data: body,
    }).then(() => {
      return this.get('globalStore').find('user', null, {forceReload: true, filter: {me: true}})
        .then((user) => {
          this.set('admin', true); // TODO 2.0 super user
          set(this, 'me', get(user,'firstObject'));
          return user.get('firstObject');
        })
        .catch((res) => {
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
  isOwner() {
    // @TODO-2.0
    return true;
  },

  allows(resource, permission, scope) {
    //console.log('rbac-allows',resource,permission,scope);
    if (!resource) {
      //console.log('rbac-result 1 false');
      return false;
    }

    scope = scope ? scope : 'global';
    permission = permission ? permission : 'list';

    if (!isArray(resource)) {
      resource = [resource];
    }

    const store = get(this, `${scope}Store`);
    if ( !store ) {
      //console.log('rbac-result 2 false');
      return false;
    }

    if (permission === 'list') {
      //console.log('rbac-result 3',!!resource.some(r => store.canList(r)));
      return resource.some(r => store.canList(r));
    } else if (permission === 'create') {
      //console.log('rbac-result 4',!!resource.some(r => store.canCreate(r)));
      return resource.some(r => store.canCreate(r));
    }

    //console.log('rbac-result 5 false');
    return false;
  },
});
