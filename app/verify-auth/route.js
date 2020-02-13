import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { addQueryParams, parseUrl } from 'shared/utils/util';
import { reject } from 'rsvp';
import VerifyAuth from 'ui/mixins/verify-auth';

const samlProviders = ['ping', 'adfs', 'keycloak', 'okta', 'shibboleth'];
const allowedForwards = ['localhost'];

export default Route.extend(VerifyAuth, {
  oauth:    service(),
  intl:     service(),
  language: service('user-language'),

  beforeModel() {
    if (!this.intl.locale) {
      return get(this, 'language').initUnauthed();
    }
  },

  model(params/* , transition */) {
    const oauth  = get(this, 'oauth');
    const code    = get(params, 'code');
    const forward = get(params, 'forward');

    // Allow another redirect if the hostname is in the whitelist above.
    // This allows things like sharing github auth between rancher at localhost:8000
    // and rio dev at localhost:8004
    if ( forward ) {
      const parsed = parseUrl(forward);

      if ( allowedForwards.includes(parsed.hostname.toLowerCase()) ) {
        if ( get(params, 'login') ) {
          window.location.href = addQueryParams(forward, {
            forwarded: 'true',
            code
          });
        } else {
          oauth.login(forward);
        }
      } else {
        return reject(new Error('Invalid forward url'));
      }

      return;
    }

    if ( window.opener && !get(params, 'login') && !get(params, 'errorCode') ) {
      let openersOauth  = window.opener.ls('oauth');
      let openerStore   = window.opener.ls('globalStore');
      let qp            = get(params, 'config') || get(params, 'authProvider');
      let type          = `${ qp }Config`;
      let config        = openerStore.getById(type, qp);
      let stateMsg      = 'Authorization state did not match, please try again.';
      let isGithub      = get(params, 'config') === 'github'
      let isGoogle      = get(params, 'config') === 'googleoauth'

      if ( isGithub || isGoogle ) {
        return oauth.testConfig(config).then((resp) => {
          oauth.authorize(resp, openersOauth.get('state'));
        }).catch((err) => {
          reply({ err });
        });
      } else if ( samlProviders.includes(get(params, 'config')) ) {
        if ( window.opener.window.onAuthTest ) {
          reply(null, config);
        } else {
          reply({ err: 'failure' });
        }
      }

      if ( get(params, 'code') ) {
        if ( openersOauth.stateMatches(get(params, 'state')) ) {
          reply(params.error_description, params.code);
        } else {
          reply(stateMsg);
        }
      }

      if ( get(params, 'oauth_token') && get(params, 'oauth_verifier') ) {
        reply(null, {
          oauthToken:    get(params, 'oauth_token'),
          oauthVerifier: get(params, 'oauth_verifier'),
        });
      }
    }

    if ( code && get(params, 'state').includes('login') ) {
      const providerType = get(params, 'state').includes('github') ? 'github' : 'googleoauth'

      if ( oauth.stateMatches(get(params, 'state')) ) {
        const currentProvider = get(this, 'access.providers').findBy('id', providerType);

        return currentProvider.doAction('login', {
          code,
          responseType: 'cookie',
          description:  C.SESSION.DESCRIPTION,
          ttl:          C.SESSION.TTL,
        }).then(() => {
          return get(this, 'access').detect()
            .then(() => this.transitionTo('authenticated'));
        });
      }
    }

    if (get(params, 'errorCode')) {
      let errorMessageKey         = get(params, 'errorMsg') || null;
      let errorMessageTranslation = this.intl.t('loginPage.error.unknown');
      let locale                  = this.intl.locale || ['en-us'];

      if (errorMessageKey && this.intl.exists(`loginPage.error.${ errorMessageKey }`, locale)) {
        errorMessageTranslation = this.intl.t(`loginPage.error.${ errorMessageKey }`);
      }

      reply(errorMessageTranslation, get(params, 'errorCode'));
    }

    function reply(err, code) {
      try {
        window.opener.window.onAuthTest(err, code);
        setTimeout(() => {
          window.close();
        }, 250);

        return new RSVP.promise();
      } catch (e) {
        window.close();
      }
    }
  }

});
