import { resolve, reject } from 'rsvp';
import { observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { next } from '@ember/runloop';
import { hash } from 'rsvp'
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { get, set } from '@ember/object';
import { isArray } from '@ember/array';

export default Service.extend({
  cookies:        service(),
  settings:       service(),
  session:        service(),
  github:         service(),
  shibbolethAuth: service(),
  globalStore:    service(),
  clusterStore:   service(),
  projectStore:   service('store'),
  app:            service(),

  me:       null,
  userCode: null,

  // These are set by authenticated/route
  // Is access control enabled
  enabled: true, // @TODO-2.0 remove this, always enabled

  // What kind of access control
  provider:  null,  // @TODO-2.0 remove this, and how do i check?
  providers: null,
  principal: null,

  // Are you an admin
  admin: alias('me.hasAdmin'),

  mustChangePassword: alias('me.mustChangePassword'),

  // The identity from the session isn't an actual identity model...
  identity:      null,
  identityObsvr: on('init', observer(`session.${ C.SESSION.IDENTITY }`, function() {
    var obj = this.get(`session.${ C.SESSION.IDENTITY }`) || {};

    obj.type = 'identity';
    this.set('identity', this.get('globalStore').createRecord(obj));
  })),


  testAuth() {
    // make a call to api base because it is authenticated
    return this.get('globalStore').rawRequest({ url: '', }).then((/* xhr*/) => {
      // Auth token still good
      return resolve('Auth Succeeded');
    }, (/* err */) => {
      // Auth token expired
      return reject('Auth Failed');
    });
  },

  detect() {
    const globalStore = get(this, 'globalStore');

    return hash({
      pl:           globalStore.request({ url: `settings/${ C.SETTING.PL }` }),
      firstSetting: globalStore.request({ url: `settings/${ C.SETTING.FIRST_LOGIN }` }),
      providers:    globalStore.request({ url: '/v3-public/authProviders' }),
    }).then(({
      providers, pl, firstSetting
    }) => {
      if ( providers && get(providers, 'length') ) {
        set(this, 'providers', providers);
        if (get(providers, 'length') === 1) {
          set(this, 'provider', get(providers, 'firstObject.id'));
        }
      } else {
        set(this, 'providers', []);
      }

      if ( pl ) {
        get(this, 'settings').notifyPropertyChange(C.SETTING.PL);
      }

      set(this, 'firstLogin', (`${ firstSetting.value }`) === 'true');

      return this.loadMe();
    }).catch((err) => {
      next(() => {
        set(this, 'app.initError', ( err && err.message ) ? err : { message: 'No response received' } );
      });
      set(this, 'providers', []);
    });
  },

  loadMe() {
    const globalStore = get(this, 'globalStore');

    return globalStore.request({ url: 'users?me=true' }).then((users) => {
      const me = get(users, 'firstObject');

      set(this, 'me', me);

      return me;
    }).catch((err) => {
      return err;
    });
  },

  shibbolethConfigured(token) {
    let rv = false;

    if ((token.authProvider || '') === 'shibbolethconfig' && token.userIdentity) {
      rv = true;
    }

    return rv;
  },

  login(providerId, body) {
    body.description = C.SESSION.DESCRIPTION;
    body.responseType = 'cookie';
    body.ttl = C.SESSION.TTL;
    body.labels = { 'ui-session': 'true', };

    let url;
    let provider = (get(this, 'providers') || []).findBy('id', providerId);

    if ( provider ) {
      url = provider.actionLinks.login;
    } else {
      return reject({
        type:    'error',
        message: 'Provider config not found'
      });
    }

    console.log('Logging into', url);
    let req = this.get('globalStore').rawRequest({
      method: 'POST',
      url,
      data:   body,
    }).then(() => {
      return this.loadMe()
        .catch((res) => {
          let err;

          try {
            err = res.body;
          } catch (e) {
            console.log('Error loading user', e, res);
            err = {
              type:    'error',
              message: 'Error loading user'
            };
          }

          return reject(err);
        });
    }).catch((res) => {
      let err;

      try {
        err = res.body;
      } catch (e) {
        console.log('Error logging in', e, res);
        err = {
          type:    'error',
          message: 'Error logging in'
        };
      }

      return reject(err);
    });

    return req;
  },

  clearToken() {
    return this.get('globalStore').rawRequest({
      url:    'tokens?action=logout',
      method: 'POST',
    }).then(() => {
      return true;
    });
  },

  clearSessionKeys(all) {
    if ( all === true ) {
      this.get('session').clear();
    } else {
      var values = {};

      C.TOKEN_TO_SESSION_KEYS.forEach((key) => {
        values[key] = undefined;
      });

      this.get('session').setProperties(values);
    }

    this.get('cookies').remove(C.COOKIE.TOKEN);
  },

  allows(resource, permission, scope) {
    // console.log('rbac-allows',resource,permission,scope);
    if (!resource) {
      // console.log('rbac-result 1 false');
      return false;
    }

    scope = scope ? scope : 'global';
    permission = permission ? permission : 'list';

    if (!isArray(resource)) {
      resource = [resource];
    }

    const store = get(this, `${ scope }Store`);

    if ( !store ) {
      // console.log('rbac-result 2 false');
      return false;
    }

    if (permission === 'list') {
      // console.log('rbac-result 3',!!resource.some(r => store.canList(r)));
      return resource.some((r) => store.canList(r));
    } else if (permission === 'create') {
      // console.log('rbac-result 4',!!resource.some(r => store.canCreate(r)));
      return resource.some((r) => store.canCreate(r));
    }

    // console.log('rbac-result 5 false');
    return false;
  },
});
