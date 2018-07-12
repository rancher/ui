import {
  get, set, computed
} from '@ember/object';
import { observer } from '@ember/object';
import { once, later } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';

export default Controller.extend({
  github:         service(),
  endpoint:       service(),
  access:         service(),
  settings:       service(),
  confirmDisable: false,
  errors:         null,
  testing:        false,
  error:          null,
  saved:          false,
  saving:         false,
  haveToken:      false,

  organizations:  null,
  isEnterprise:   false,
  secure:         true,

  protocolChoices: [
    {
      label: 'https:// -- Requires a cert from a public CA',
      value: 'https://'
    },
    {
      label: 'http://',
      value: 'http://'
    },
  ],

  githubConfig:   alias('model.githubConfig'),

  scheme:         alias('githubConfig.scheme'),
  isEnabled:      alias('githubConfig.enabled'),

  createDisabled: computed('githubConfig.{clientId,clientSecret,hostname}', 'testing', 'isEnterprise', 'haveToken', function() {

    if (!get(this, 'haveToken')) {

      return true;

    }
    if ( get(this, 'isEnterprise') && !get(this, 'githubConfig.hostname') ) {

      return true;

    }

    if ( get(this, 'testing') ) {

      return true;

    }

  }),

  providerName: computed('githubConfig.hostname', function() {

    if ( get(this, 'githubConfig.hostname') &&  get(this, 'githubConfig.hostname') !== 'github.com') {

      return 'authPage.github.enterprise';

    } else {

      return 'authPage.github.standard';

    }

  }),

  numUsers: computed('githubConfig.allowedPrincipals.@each.externalIdType', 'wasRestricted', function() {

    return ( get(this, 'githubConfig.allowedPrincipalIds') || []).filter((principal) => principal.includes(C.PROJECT.TYPE_GITHUB_USER)).get('length');

  }),

  numOrgs: computed('githubConfig.allowedPrincipals.@each.externalIdType', 'wasRestricted', function() {

    return ( get(this, 'githubConfig.allowedPrincipalIds') || []).filter((principal) => principal.includes(C.PROJECT.TYPE_GITHUB_ORG)).get('length');

  }),

  destinationUrl: computed(() => {

    return `${ window.location.origin }/`;

  }),

  enterpriseDidChange: observer('isEnterprise', 'githubConfig.hostname', 'secure', function() {

    once(this, 'updateEnterprise');

  }),

  actions: {
    save() {

      this.send('clearError');
      set(this, 'saving', true);

      const githubConfig = get(this, 'githubConfig');
      const am           = get(githubConfig, 'accessMode') || 'restricted';

      githubConfig.setProperties({
        'clientId':            (githubConfig.get('clientId') || '').trim(),
        'clientSecret':        (githubConfig.get('clientSecret') || '').trim(),
        'enabled':             false, // It should already be, but just in case..
        'accessMode':          am,
        'tls':                  true,
        'allowedPrincipalIds': [],
      });

      get(this, 'github').setProperties({
        hostname: githubConfig.get('hostname'),
        scheme:   githubConfig.get('scheme'),
        clientId: githubConfig.get('clientId')
      });


      set(this, '_boundSucceed', this.authenticationApplied.bind(this));
      get(this, 'github').test(githubConfig, get(this, '_boundSucceed'));

    },


    waitAndRefresh(url) {

      $('#loading-underlay, #loading-overlay').removeClass('hide').show(); // eslint-disable-line
      setTimeout(() => {

        window.location.href = url || window.location.href;

      }, 1000);

    },

    promptDisable() {

      set(this, 'confirmDisable', true);
      later(this, function() {

        set(this, 'confirmDisable', false);

      }, 10000);

    },

    gotError(err) {

      if ( err.message ) {

        this.send('showError', err.message + (err.detail ? `(${ err.detail })` : ''));

      } else {

        this.send('showError', `Error (${ err.status  } - ${  err.code })`);

      }

      set(this, 'testing', false);

    },

    showError(msg) {

      set(this, 'errors', [msg]);
      window.scrollY = 10000;

    },

    clearError() {

      set(this, 'errors', null);

    },

    disable() {

      this.send('clearError');

      let model = get(this, 'githubConfig').clone();

      model.setProperties({ 'enabled': false, });

      model.doAction('disable').then(() => {

        this.send('waitAndRefresh');

      })
        .catch((err) => {

          this.send('gotError', err);

        })
        .finally(() => {

          set(this, 'confirmDisable', false);

        });

    },
  },
  updateEnterprise() {

    if ( get(this, 'isEnterprise') ) {

      var hostname = get(this, 'githubConfig.hostname') || '';
      var match = hostname.match(/^http(s)?:\/\//i);

      if ( match ) {

        set(this, 'secure', ((match[1] || '').toLowerCase() === 's'));
        hostname = hostname.substr(match[0].length).replace(/\/.*$/, '');
        set(this, 'githubConfig.hostname', hostname);

      }

    } else {

      set(this, 'githubConfig.hostname', 'github.com');
      set(this, 'secure', true);

    }

    set(this, 'scheme', get(this, 'secure') ? 'https://' : 'http://');

  },

  authenticationApplied(err) {

    set(this, 'saving', false);

    if (err) {

      set(this, 'isEnabled', false);
      this.send('gotError', err);

      return;

    }

    this.send('clearError');

  },
});
