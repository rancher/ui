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
  azureAD:  service(),
  language: service('user-language'),

  beforeModel() {
    if (!this.intl.locale) {
      return get(this, 'language').initUnauthed();
    }
  },

  model(params/* , transition */) {
    const oauth  = get(this, 'oauth');
    const azure  = get(this, 'azureAD');

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

    if (get(params, 'errorCode')) {
      let errorMessageKey         = get(params, 'errorMsg') || null;
      let errorMessageTranslation = this.intl.t('loginPage.error.unknown');
      let locale                  = this.intl.locale || ['en-us'];

      if (errorMessageKey && this.intl.exists(`loginPage.error.${ errorMessageKey }`, locale)) {
        errorMessageTranslation = this.intl.t(`loginPage.error.${ errorMessageKey }`);
      }

      reply(errorMessageTranslation, get(params, 'errorCode'));
    }



    const code    = get(params, 'code');
    const state = get(params, 'state')

    /*
     presence of window.opener indicates this is inital setup popup, not login
     handle auth enable
    */
    if (window.opener){
      let openersOauth  = window.opener.ls('oauth');
      let openerStore   = window.opener.ls('globalStore');
      let openersAzure = window.opener.ls('azure-ad')

      if (!state){
        let provider = get(params, 'config') || get(params, 'authProvider')
        let type          = `${ provider }Config`;
        let config        = openerStore.getById(type, provider);

        // do nothing & close popup for saml
        if ( samlProviders.includes(provider) ) {
          if ( window.opener.window.onAuthTest ) {
            reply(null, config);
          } else {
            reply({ err: 'failure' });
          }
        } else if (provider === 'azuread'){
          return azure.testConfig(config).then((resp) => {
            azure.test(resp, openersAzure.get('state'));
          }).catch((err) => {
            reply({ err });
          });
        } else {
          // redirect to 3rd party login for oauth
          return oauth.testConfig(config).then((resp) => {
            oauth.authorize(resp, openersOauth.get('state'));
          }).catch((err) => {
            reply({ err });
          });
        }
        // if state is defined, this route was hit via redirect from 3rd party auth;
        // validate nonce and close window
      } else {
        let stateMsg = 'Authorization state did not match, please try again.';
        let parsedState

        try {
          parsedState = JSON.parse(oauth.decodeState(state))
        } catch {
          reply({ err: 'nonce' })
        }
        // handle github/google/azuread
        if ( get(params, 'code') ) {
          let openers = openersOauth

          if (parsedState.provider === 'azuread'){
            openers = openersAzure
          }
          if ( openers.stateMatches(get(parsedState, 'nonce')) ) {
            reply(params.error_description, params.code);
          } else {
            reply(stateMsg);
          }

          // handle bitbucket
        } else if ( get(params, 'oauth_token') && get(params, 'oauth_verifier') ) {
          reply(null, {
            oauthToken:    get(params, 'oauth_token'),
            oauthVerifier: get(params, 'oauth_verifier'),
          });
        }
      }
      // handle login verification
    } else {
      let parsedState

      try {
        parsedState = JSON.parse(oauth.decodeState(state))
      } catch {
        reply({ err: 'nonce' })
      }
      if (oauth.stateMatches(parsedState.nonce) || (parsedState.provider === 'azuread' && azure.stateMatches(parsedState.nonce))){
        const providerType = parsedState.provider

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



    function reply(err, code) {
      try {
        let cb = window.opener.window.onAuthTest

        if (window.opener.window.onAzureTest){
          cb = window.opener.window.onAzureTest
        }
        cb(err, code);
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
