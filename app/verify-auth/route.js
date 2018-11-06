import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { addQueryParams, parseUrl } from 'shared/utils/util';
import { reject } from 'rsvp';
import VerifyAuth from 'ui/mixins/verify-auth';

const samlProviders = ['ping', 'adfs', 'keycloak'];
const allowedForwards = ['localhost'];

export default Route.extend(VerifyAuth, {
  github: service(),

  model(params/* , transition */) {
    const github  = get(this, 'github');
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
          github.login(forward);
        }
      } else {
        return reject(new Error('Invalid forward url'));
      }

      return;
    }

    if ( window.opener && !get(params, 'login') ) {
      let openersGithub = window.opener.ls('github');
      let openerStore   = window.opener.ls('globalStore');
      let qp            = get(params, 'config') || get(params, 'authProvider');
      let type          = `${ qp }Config`;
      let config        = openerStore.getById(type, qp);
      let gh            = get(this, 'github');
      let stateMsg      = 'Authorization state did not match, please try again.';

      if ( get(params, 'config') === 'github' ) {
        return gh.testConfig(config).then((resp) => {
          gh.authorize(resp, openersGithub.get('state'));
        }).catch((err) => {
          this.send('gotError', err);
        });
      } else if ( samlProviders.includes(get(params, 'config')) ) {
        if ( window.opener.window.onAuthTest ) {
          reply(null, config);
        } else {
          reply({ err: 'failure' });
        }
      }

      if ( get(params, 'code') ) {
        if ( openersGithub.stateMatches(get(params, 'state')) ) {
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

    if ( code && get(params, 'login') ) {
      if ( github.stateMatches(get(params, 'state')) ) {
        let ghProvider = get(this, 'access.providers').findBy('id', 'github');

        return ghProvider.doAction('login', {
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
