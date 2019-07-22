import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { once } from '@ember/runloop';
import { set, get, observer, setProperties } from '@ember/object';

export default Component.extend({
  router:     service(),
  gitService: service('pipeline-github'),

  oauthType:        'github',
  oauthHost:        'github.com',
  provider:         null,
  errors:           null,
  useGloableConfig: true,
  githubAuthConfig: null,
  testing:          false,
  secure:           true,
  isEnterprise:     false,

  didReceiveAttrs() {
    setProperties(this, {
      homePageURL:    window.location.origin,
      destinationUrl: window.location.origin
    });
  },

  actions: {
    changeOauthSource(useGloableConfig) {
      set(this, 'useGloableConfig', useGloableConfig);
    },

    githubAuthConfigAuthenticate() {
      const githubAuthConfig = get(this, 'githubAuthConfig');

      this.send('authenticate', null, get(githubAuthConfig, 'clientId'), get(githubAuthConfig, 'hostName'), get(githubAuthConfig, 'tls'), true)
    },

    authenticate(cb, client, host, isTls, inheritAuth, callBack) {
      const clientId = client || get(this, 'oauthModel.clientId');
      let hostname = host || get(this, 'oauthModel.hostName') || get(this, 'oauthHost');
      const tls = isTls === undefined ? get(this, 'oauthModel.scheme') : isTls;
      const scheme = tls ? 'https://' : 'http://';
      const authorizeURL = `${ scheme }${ hostname }${ this.getOauthUrl(clientId) }`;

      set(this, 'testing', true);
      get(this, 'gitService').authorizeTest(
        authorizeURL,
        (err, code) => {
          if (err) {
            this.send('gotError', err);
            set(this, 'testing', false);
            if ( cb ) {
              cb();
            }
          } else {
            callBack && callBack(code) || this.send('gotCode', code, hostname, tls, inheritAuth, cb);
          }
        }
      );
    },

    gotCode(code, hostname, tls, inheritAuth, cb) {
      const provider = get(this, 'provider');
      const oauthModel = get(this, 'oauthModel');
      const param = {
        code,
        clientId:     oauthModel.clientId,
        clientSecret: oauthModel.clientSecret,
        redirectUrl:  `${ get(this, 'destinationUrl') }/verify-auth`,
        inheritAuth:  !!inheritAuth,
        hostname,
        tls,
      };

      provider.doAction('testAndApply', param).then(() => {
        set(this, 'testing', false);
        if ( cb ) {
          cb();
        }
        get(this, 'router').transitionTo('authenticated.project.pipeline.repositories');
      }).catch((res) => {
        this.send('gotError', res);
        set(this, 'testing', false);
        if ( cb ) {
          cb();
        }
      });
    },

    gotError(err) {
      if ( get(err, 'message') ) {
        this.send('showError', get(err, 'message') + (get(err, 'detail') ? `(${ get(err, 'detail') })` : ''));
      } else if (typeof err === 'object') {
        this.send('showError', `Error (${ get(err, 'status') } - ${ get(err, 'code') })`);
      } else {
        this.send('showError', `Error (${ err })`);
      }

      set(this, 'testing', false);
    },

    showError(msg) {
      set(this, 'errors', [msg]);
      window.scrollY = 10000;
    },
  },

  enterpriseDidChange: observer('isEnterprise', 'oauthModel.hostName', 'secure', function() {
    if (get(this, 'oauthModel.isAuth')) {
      return
    }
    once(this, 'updateEnterprise');
  }),

  getOauthUrl(clientId) {
    return `/login/oauth/authorize?client_id=${ clientId }&response_type=code&scope=repo+admin%3Arepo_hook`;
  },

  updateEnterprise() {
    if (get(this, 'isEnterprise')) {
      let hostname = get(this, 'oauthModel.hostName') || '';
      const match = hostname.match(/^http(s)?:\/\//i);

      if (match) {
        setProperties(this, {
          secure:                (match[1] || '').toLowerCase() === 's',
          'oauthModel.hostName': hostname.substr(match[0].length).replace(/\/.*$/, '')
        });
      }
    } else {
      setProperties(this, {
        secure:                true,
        'oauthModel.hostName': null
      });
    }

    set(this, 'oauthModel.scheme', get(this, 'secure'));
  },
});
