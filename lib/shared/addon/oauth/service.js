import Service, { inject as service } from '@ember/service';
import { addQueryParam, addQueryParams, popupWindowOptions } from 'shared/utils/util';
import { get, set } from '@ember/object';
import C from 'shared/utils/constants';

const googleOauthScope = 'openid profile email';
const githubOauthScope = 'read:org';
const oidcOauthScope = 'openid';

export default Service.extend({
  access:      service(),
  cookies:     service(),
  session:     service(),
  globalStore: service(),
  app:         service(),
  intl:        service(),
  authType:    '',

  generateState(provider = '') {
    const state = JSON.stringify({
      to:    'ember',
      provider,
      nonce: Math.random(),
      test:  true
    })


    return set(this, 'session.oauthState', state);
  },

  generateLoginStateKey(provider) {
    const state = JSON.stringify({
      to:       'ember',
      provider,
      nonce:    Math.random(),
      test:     false
    })

    return set(this, 'session.oauthState', state);
  },

  encodeState(state){
    const m = {
      '+': '-',
      '/': '_',
    }

    return AWS.util.base64.encode(state).replace(/[+/]|=+$/g, (char) => m[char] || '')
  },

  decodeState(state){
    return AWS.util.base64.decode(`${ state.replace(/[-_]/g, (char) => char === '-' ? '+' : '/') }=`).toString()
  },

  stateMatches(actual) {
    const state = get(this, 'session.oauthState')

    try {
      const parsedState = JSON.parse(state)

      return actual && actual === parsedState.nonce
    } catch {
      return false
    }
  },

  testConfig(config) {
    return config.doAction('configureTest', config);
  },

  saveConfig(config, opt) {
    return config.doAction('testAndApply', opt);
  },

  authorize(auth, state) {
    const isGithub = auth.type.includes('github');
    const isOidc = auth.type.includes('oidc');
    let url = null;


    if (isGithub) {
      url = addQueryParams(get(auth, 'redirectUrl'), {
        scope:        githubOauthScope,
        redirect_uri: `${ window.location.origin }/verify-auth`,
        authProvider: 'github',
        state,
      });
    } else if (isOidc) {
      // debugger;
      url = addQueryParams(get(auth, 'redirectUrl'), {
        scope:         oidcOauthScope,
        response_type: 'code',
        authProvider:  'oidc',
        state,
      });
    } else {
      url = addQueryParams(get(auth, 'redirectUrl'), {
        scope:          googleOauthScope,
        redirect_uri:   `${ window.location.origin }/verify-auth`,
        state,
      });
    }

    return window.location.href = url;
  },

  login(authType, forwardUrl) {
    const provider     = get(this, 'access.providers').findBy('id', authType);
    const authRedirect = get(provider, 'redirectUrl');
    let   redirect     = `${ window.location.origin }/verify-auth`;

    if ( forwardUrl ) {
      redirect = addQueryParam(redirect, 'forward', forwardUrl);
    }

    let url = addQueryParams(authRedirect, {
      scope:          authType === 'github' ? githubOauthScope : googleOauthScope,
      state:          this.encodeState(this.generateLoginStateKey(authType)),
      redirect_uri:   redirect,
    });

    window.location.href = url;
  },

  test(config, cb) {
    let responded = false;
    let configName = config.name;

    window.onAuthTest = (err, code) => {
      if ( !responded && !err ) {
        let ghConfig = config;

        responded = true;

        this.finishTest(ghConfig, code, cb);
      }
    };

    set(this, 'state', this.encodeState(this.generateState(config.name)));
    let url = addQueryParams(`${ window.location.origin }/verify`, { config: configName, });

    const popup = window.open(url, 'rancherAuth', popupWindowOptions());
    const intl = get(this, 'intl');

    let timer = setInterval(() => {
      if (popup && popup.closed ) {
        clearInterval(timer);

        if ( !responded ) {
          responded = true;
          cb({
            type:    'error',
            message: intl.t(`authPage.${ configName }.testAuth.authError`)
          });
        }
      } else if (popup === null || typeof (popup) === 'undefined') {
        clearInterval(timer);

        if ( !responded ) {
          responded = true;

          cb({
            type:    'error',
            message: intl.t(`authPage.${ configName }.testAuth.popupError`)
          });
        }
      }
    }, 500);
  },

  finishTest(config, code, cb) {
    const currentConfig = config;
    let out = null;

    set(currentConfig, 'enabled', true);

    if (config.id === 'googleoauth') {
      out = {
        code,
        enabled:            true,
        googleOauthConfig:  currentConfig,
        description:        C.SESSION.DESCRIPTION,
        ttl:                C.SESSION.TTL,
      };
    } else if (config.id === 'oidc') {
      out = {
        code,
        enabled:            false,
        oidcConfig:         currentConfig,
      };
    } else {
      out = {
        code,
        enabled:      true,
        githubConfig: currentConfig,
        description:  C.SESSION.DESCRIPTION,
        ttl:          C.SESSION.TTL,
      };
    }

    const allowedPrincipalIds = get(config, 'allowedPrincipalIds') || [];

    return this.saveConfig(config, out).then(() => {
      let found = false;
      const myPIds = get(this, 'access.me.principalIds');

      myPIds.forEach( (id) => {
        if (allowedPrincipalIds.indexOf(id) >= 0) {
          found = true;
        }
      });

      if ( !found && !allowedPrincipalIds.length) {
        allowedPrincipalIds.pushObject(get(this, 'access.principal.id'));
      }

      return currentConfig.save().then(() => {
        window.location.href = window.location.href; // eslint-disable-line no-self-assign
      });
    })
      .catch((err) => {
        cb(err);
      });
  },
});
