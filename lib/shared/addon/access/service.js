import { resolve, reject } from 'rsvp';
import { observer } from '@ember/object';
import { alias } from '@ember/object/computed';
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

  loadedVersion: null,
  me: null,

  // These are set by authenticated/route
  // Is access control enabled
  enabled: true, // @TODO-2.0 remove this, always enabled

  // What kind of access control
  provider: 'local',  // @TODO-2.0 remove this, and how do i check?
  providers: null,

  // Are you an admin
  admin: alias('me.hasAdmin'),

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
    const self = this;
    const globalStore = get(this,'globalStore');

    return globalStore.request({
      url: '/v3-public/authProviders',
    }).then((providers) => {
      if ( providers && get(providers,'length') ) {
        set(this, 'providers', providers);
      } else {
        set(this, 'providers', null);
      }
      return done();
    }).catch(() => {
      set(this, 'providers', null);
      return done();
    });

    function done() {
      return globalStore.request({
        url: 'users?me=true',
      })
      .then((users) => {
        if ( get(users, 'length') ) {
          set(self, 'me', get(users,'firstObject'));
        }

        return resolve(undefined, `API supports authentication`);

        // // If we get a good response back, the API supports authentication
        // var token = xhr.body.data[0];

        // self.setProperties({
        //   'loadedVersion': xhr.headers.get(C.HEADER.RANCHER_VERSION), // TODO 2.0 do we still need the version?
        // });
      })
      .catch((err) => {
        // Otherwise this API is too old to do auth, or something else went wrong since that's impossible in 2.0
        self.set('app.initError', err);
        return resolve(undefined,'Error determining API authentication');
      });
    }
  },

  shibbolethConfigured(token) {
    let rv = false;
    if ((token.authProvider||'') === 'shibbolethconfig' && token.userIdentity) {
      rv = true;
    }
    return rv;
  },

  login(providerId, body) {
    body.description = 'UI Session';
    body.responseType = 'cookie';
    body.ttl = 16*60*60*1000;
    body.labels = {
      'ui-session': 'true',
    };

    let url;
    if ( providerId === 'legacy' ) {
      url = 'tokens?action=login';
    } else {
      let provider = (get(this,'providers')||[]).findBy('id', providerId);
      if ( provider ) {
        url = provider.actionLinks.login;
      } else {
        return reject({type: 'error', message: 'Provider config not found'});
      }
    }

    console.log('Logging into',url);
    let req = this.get('globalStore').rawRequest({
      method: 'POST',
      url: url,
      data: body,
    }).then(() => {
      return this.get('globalStore').find('user', null, {forceReload: true, filter: {me: true}})
        .then((users) => {
          let me = get(users,'firstObject');
          set(this, 'me', me);
          return me;
        })
        .catch((res) => {
          let err;
          try {
            err = res.body;
          } catch(e) {
            console.log('Error 1 logging in', e, res);
            err = {type: 'error', message: 'Error 1 logging in'};
          }
          return reject(err);
        });
    }).catch((res) => {
      let err;
      try {
        err = res.body;
      } catch(e) {
        console.log('Error 2 logging in', e, res);
        err = {type: 'error', message: 'Error logging in'};
      }
      return reject(err);
    });

    return req;
  },

  clearToken() {
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
