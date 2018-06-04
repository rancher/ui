import Component from '@ember/component';
import C from 'ui/utils/constants';
import { inject as service } from '@ember/service';
import { later, once, cancel } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { oauthURIGenerator } from 'pipeline/utils/gitOauth';
import { set, get, observer, computed } from '@ember/object';

export default Component.extend({
  router:     service(),
  session:    service(),
  gitService: service('pipeline-github'),

  classNames: ['accordion-wrapper'],

  selectedOauthType:    'github',
  oauthModel:           {},
  useGloableConfig:     true,
  homePageURL:          null,
  destinationUrl:       null,
  errors:               null,
  testing:              false,
  statusClass:          null,
  status:               '',
  scale:                null,
  secure:               true,
  isEnterprise:         false,
  confirmDisable:       false,

  scaleTimer: null,

  accountId:           alias(`session.${ C.SESSION.ACCOUNT_ID }`),
  didReceiveAttrs() {
    set(this, 'homePageURL', window.location.origin);
    set(this, 'destinationUrl', window.location.origin);
    const quota = get(this, 'settings').findBy('name', 'executor-quota');

    set(this, 'scale', quota);

    // set default oauth
    const provider = get(this, 'provider');

    if ( !provider ) {
      return;
    }
    let oauthed;

    if ( provider.get('type') === 'githubProvider' ) {
      oauthed = provider.get('githubConfig') || null;
      set(this, 'selectedOauthType', 'github');
    } else if ( provider.get('type') === 'gitlabProvider' ) {
      oauthed = provider.get('gitlabConfig') || null;
      set(this, 'selectedOauthType', 'gitlab');
    }
    const store = get(this, 'store');

    if (!oauthed) {
      oauthed = store.createRecord({
        type:   'sourcecodecredential',
        scheme: true,
      });
    }
    set(this, 'oauthModel', oauthed);
  },

  actions: {
    changeOauthSource(useGloableConfig) {
      set(this, 'useGloableConfig', useGloableConfig);
    },

    scaleDown() {
      set(this, 'scale.value', parseInt(get(this, 'scale.value'), 10) - 1);
      this.saveScale();
    },

    scaleUp() {
      set(this, 'scale.value', parseInt(get(this, 'scale.value'), 10) + 1);
      this.saveScale();
    },

    changeOauthType(type) {
      set(this, 'selectedOauthType', type);
      const store = get(this, 'store');

      set(this, 'oauthModel', store.createRecord({
        type:   'sourcecodecredential',
        scheme: true,
      }));
    },

    githubAuthConfigAuthenticate() {
      const githubAuthConfig = get(this, 'githubAuthConfig');

      this.send('authenticate', githubAuthConfig.clientId, githubAuthConfig.hostName, githubAuthConfig.tls, true)
    },

    disable() {
      const provider = get(this, 'provider');

      set(this, 'disabling', true);
      provider.doAction('disable').finally(() => {
        set(this, 'disabling', false);
        this.send('changeOauthType', 'github');
      });
    },

    promptDisable() {
      set(this, 'confirmDisable', true);
      later(this, function() {
        set(this, 'confirmDisable', false);
      }, 10000);
    },

    authenticate(clientId_P, hostName_P, tls_P, inheritAuth, callBack) {
      const clientId = clientId_P || get(this, 'oauthModel.clientId');
      let hostname = hostName_P || get(this, 'oauthModel.hostName') || `${ get(this, 'selectedOauthType') }.com`;
      const tls = tls_P === undefined ? get(this, 'oauthModel.scheme') : tls_P;
      const scheme = tls ? 'https://' : 'http://';
      const oauthURI = oauthURIGenerator(clientId);
      const authorizeURL = scheme + hostname + oauthURI[get(this, 'selectedOauthType')];

      set(this, 'testing', true);
      get(this, 'gitService').authorizeTest(
        authorizeURL,
        (err, code) => {
          if (err) {
            this.send('gotError', err);
            set(this, 'testing', false);
          } else {
            callBack && callBack(code) || this.send('gotCode', code, hostname, tls, inheritAuth);
          }
        }
      );
    },

    gotCode(code, hostname, tls, inheritAuth) {
      const provider = get(this, 'provider');
      const oauthModel = get(this, 'oauthModel');
      const param = {
        code,
        enabled:     true,
        inheritAuth: !!inheritAuth,
      };

      if ( !inheritAuth ) {
        const key = `${ get(this, 'selectedOauthType') }Config`;

        param[key] = {
          clientId:     oauthModel.clientId,
          clientSecret: oauthModel.clientSecret,
          hostname,
          tls,
        }
      }
      provider.doAction('testAndApply', param).then(() => {
        set(this, 'testing', false);
        get(this, 'router').transitionTo('authenticated.project.pipeline.repositories');
      })
        .catch((res) => {
          this.send('gotError', res);
          set(this, 'testing', false);
        });
    },

    gotError(err) {
      if (err.message) {
        this.send('showError', err.message + (err.detail ? `(${  err.detail  })` : ''));
      } else {
        this.send('showError', `Error (${  err.status  } - ${  err.code  })`);
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

  provider:  computed('selectedOauthType', 'providers.@each.enabled', function() {
    const enabled = get(this, 'providers').findBy('enabled', true);
    const selected = get(this, 'providers').findBy('name', get(this, 'selectedOauthType'));

    if ( enabled ) {
      return enabled;
    } else if ( selected ) {
      return selected;
    } else {
      return get(this, 'providers.firstObject');
    }
  }),

  updateEnterprise() {
    if (get(this, 'isEnterprise')) {
      let hostname = get(this, 'oauthModel.hostName') || '';
      const match = hostname.match(/^http(s)?:\/\//i);

      if (match) {
        set(this, 'secure', ((match[1] || '').toLowerCase() === 's'));
        hostname = hostname.substr(match[0].length).replace(/\/.*$/, '');
        set(this, 'oauthModel.hostName', hostname);
      }
    } else {
      set(this, 'oauthModel.hostName', null);
      set(this, 'secure', true);
    }

    set(this, 'oauthModel.scheme', get(this, 'secure'));
  },

  saveScale() {
    if ( get(this, 'scaleTimer') ) {
      cancel(get(this, 'scaleTimer'));
    }

    var timer = later(this, function() {
      get(this, 'scale').save()
        .catch((err) => {
          get(this, 'growl').fromError('Error updating executor quota', err);
        });
    }, 500);

    set(this, 'scaleTimer', timer);
  },

});
