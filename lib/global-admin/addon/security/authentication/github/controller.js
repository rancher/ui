import {
  get, set, computed
} from '@ember/object';
import { observer } from '@ember/object';
import { once, later } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';
import AuthMixin from 'global-admin/mixins/authentication';

export default Controller.extend(AuthMixin,{
  github:         service(),
  endpoint:       service(),
  access:         service(),
  settings:       service(),

  authConfig:     alias('model.githubConfig'),
  scheme:         alias('authConfig.scheme'),

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

      const authConfig = get(this, 'authConfig');
      const am           = get(authConfig, 'accessMode') || 'restricted';

      authConfig.setProperties({
        'clientId':            (authConfig.get('clientId') || '').trim(),
        'clientSecret':        (authConfig.get('clientSecret') || '').trim(),
        'enabled':             false, // It should already be, but just in case..
        'accessMode':          am,
        'tls':                 true,
        'allowedPrincipalIds': [],
      });

      get(this, 'github').setProperties({
        hostname: authConfig.get('hostname'),
        scheme:   authConfig.get('scheme'),
        clientId: authConfig.get('clientId')
      });


      set(this, '_boundSucceed', this.authenticationApplied.bind(this));
      get(this, 'github').test(authConfig, get(this, '_boundSucceed'));

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
