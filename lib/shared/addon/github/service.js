import Service, { inject as service } from '@ember/service';
import Util from 'shared/utils/util';
import { get, set } from '@ember/object';

export default Service.extend({
  access: service(),
  cookies  : service(),
  session  : service(),
  globalStore: service(),
  app: service(),

  generateState() {
    var state = Math.random()+'';
    get(this, 'session').set('githubState', state);
    return state;
  },

  stateMatches(actual) {
    var expected = get(this, 'session.githubState');
    return actual && expected === actual;
  },

  testConfig(config) {
    return config.doAction('configureTest', config);
  },

  saveConfig(config, opt) {
    return config.doAction('testAndApply', opt);
  },

  authorize(auth, state) {
    var url = Util.addQueryParams(get(auth, 'redirectUrl'), {
      redirect_uri: `${window.location.origin}/verify-auth`,
      authProvider: 'github',
      state: state,
      scope: 'read:org'
    });

    return window.location.href = url;
  },

  login() {
    const provider = get(this, 'access.providers').findBy('id', 'github');
    const authRedirect = get(provider, 'redirectUrl');
    const redirect = Util.addQueryParams(`${window.location.origin}/verify-auth`, {
      login: true,
      state: this.generateState(),
    });

    const url = Util.addQueryParams(authRedirect, {
      redirect_uri: redirect,
    });

    window.location.href = url;
  },

  test(config, cb) {
    var responded = false;
    window.onGithubTest = (err,code) => {
      if ( !responded ) {
        var ghConfig = config;
        responded = true;
        this.finishTest(ghConfig, code, cb);
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

  finishTest(config, code, cb) {
    let ghConfig = config.clone();
    let out = {
      code: code,
      enabled: true,
      githubConfig: ghConfig,
    };

    set(ghConfig, 'allowedPrincipalIds', [get(this, 'access.me.principalIds.firstObject')]);

    return this.saveConfig(config, out).then(() => {
      get(this, 'access').detect(); // Update the list of providers...
      cb();
    }).catch((err) => {
      cb(err);
    });
  },
});
