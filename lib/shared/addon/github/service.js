import { Promise as EmberPromise } from 'rsvp';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import Util from 'shared/utils/util';
import { get, set } from '@ember/object';

export default Service.extend({
  access: service(),
  cookies  : service(),
  session  : service(),
  globalStore: service(),
  app: service(),

  // Set by app/services/access
  hostname : null,
  scheme   : null,
  clientId : null,
  redirectUrl: null,

  generateState: function() {
    var state = Math.random()+'';
    get(this, 'session').set('githubState', state);
    return state;
  },

  getToken: function() {
    return new EmberPromise((resolve, reject) => {
      get(this, 'globalStore').rawRequest({
        url: 'token',
      })
      .then((xhr) => {
        resolve(xhr.body.data[0]);
        return ;
      })
      .catch((err) => {
        reject(err);
      });
    });
  },

  stateMatches: function(actual) {
    var expected = get(this, 'session.githubState');
    return actual && expected === actual;
  },

  testConfig(config) {
    return config.doAction('configureTest', config);
  },

  saveConfig(config, opt) {
    return config.doAction('testAndApply', opt);
  },

  gotCode: function(config, code, cb) {
    let ghConfig = config.clone();
    let out = {
      code: code,
      enabled: true,
      githubConfig: ghConfig,
    };

    set(ghConfig, 'allowedPrincipalIds', [get(this, 'access.me.principalIds.firstObject')]);

    return this.saveConfig(config, out).then(() => {
      cb();
    }).catch((err) => {
      cb(err);
    });
  },

  getAuthorizeUrl(auth, state) {
    var url = Util.addQueryParams(get(auth, 'redirectUrl'), {
      redirect_uri: `${window.location.origin}/verify-auth`,
      authProvider: 'github',
      state: state,
      scope: 'read:org'
    });

    return window.location.href = url;
  },

  getGithubAuthUrl() {
    let provider = get(this, 'access.providers').findBy('id', 'github');
    let authRedirect = get(provider, 'redirectUrl');
    let redirect = Util.addQueryParams(`${window.location.origin}/verify-auth`, {
      login: true,
      state: this.generateState(),
    });

    var url = Util.addQueryParams(authRedirect, {
      redirect_uri: redirect,
    });

    return url;
  },

  login() {
    window.location.href = this.getGithubAuthUrl();
  },

  authorizeTest: function(config, cb) {
    var responded = false;
    window.onGithubTest = (err,code) => {
      if ( !responded ) {
        var ghConfig = config;
        responded = true;
        this.gotCode(ghConfig, code, cb);
        // cb(err,code);
      }
    };

    set(this, 'state', this.generateState());

    let url = Util.addQueryParams(`${window.location.origin}/verify-auth`, {
        config: 'github',
    });

    var popup = window.open(url, 'rancherAuth', Util.popupWindowOptions());
    var timer = setInterval(function() {
      if ( !popup || popup.closed ) {
        clearInterval(timer);
        if( !responded ) {
          responded = true;
          cb({type: 'error', message: 'Github access was not authorized'});
        }
      }
    }, 500);
  },
});
