import C from 'ui/utils/constants';
import Route from '@ember/routing/route';
import RSVP, { reject } from 'rsvp';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default Route.extend({
  access         : service(),
  cookies        : service(),
  github         : service(),
  modal          : service(),
  prefs          : service(),
  settings       : service(),
  globalStore    : service(),

  queryParams: {
    config: {
      refreshModel: false
    },
    code: {
      refreshModel: false
    },
    state: {
      refreshModel: false
    },
    authProvider: {
      refreshModel: false
    },
    error_description: {
      refreshModel: false
    },
    login: {
      refreshModel: false
    }

  },

  model(params/* , transition */) {
    debugger;
    if (window.opener) {
      let openerController = window.opener.lc('security.authentication.github');
      let openerStore      = get(openerController, 'globalStore');
      let qp               = get(params, 'config') || get(params, 'authProvider');
      let type             = `${qp}Config`;
      let config           = openerStore.getById(type, qp);
      let gh = get(this, 'github');
      let stateMsg = 'Authorization state did not match, please try again.';

      if (get(params, 'config') === 'github') {

        return gh.testConfig(config).then((resp) => {
          // TODO build with url building Util
          let redirect = `${get(resp, 'redirectUrl')}&redirect_uri=${window.location.origin}/verify-auth?authProvider=github&state=${openerController.get('github.state')}&scope=read:org`;
          window.location.href = redirect;
        }).catch(err => {
          this.send('gotError', err);
        });

      }

      if (get(params, 'code')) {
        // TODO see if session.githubState works here
        if (openerController.get('github').stateMatches(get(params, 'state'))) {
          reply(params.error_description, params.code);
        } else {
          reply(stateMsg);
        }
      }

    }

    if (get(params, 'code') && get(params, 'login')) {
      // state match
      if (get(this, 'github').stateMatches(get(params, 'state'))) {
        let ghProvider = get(this, 'access.providers').findBy('id', 'github');
        return ghProvider.doAction('login', {
          code: get(params, 'code'),
          responseType: 'cookie',
        }).then(() => {
          debugger;
          this.transitionTo('/');
        });
      }
      // return get(this, 'globalStore').request({
      //   url: '/v3-public/githubProviders',
      // }).then((providers) => {

      //   if ( providers && get(providers,'length') ) {

      //     set(this, 'providers', providers);
      //     if (get(providers, 'length') === 1) {
      //       set(this, 'provider', get(providers, 'firstObject.id'));
      //     }
      //   } else {
      //     set(this, 'providers', null);
      //   }
      //   return done();

      // }).catch(() => {

      //   set(this, 'providers', null);
      //   return done();
      // });

    }

    // if ( params.isTest ) {
    //   if ( github.stateMatches(params.state) ) {
    //     reply(params.error_description, params.code);
    //   } else {
    //     reply(stateMsg);
    //   }

    //   transition.abort();

    //   return reject('isTest');

    // } else if ( params.code ) {

    //   if ( github.stateMatches(params.state) ) {
    //     return get(this, 'access').login(params.code).then(() => {
    //       // Abort the orignial transition that was coming in here since
    //       // we'll redirect the user manually in finishLogin
    //       // if we dont then model hook runs twice to finish the transition itself
    //       transition.abort();
    //       // Can't call this.send() here because the initial transition isn't done yet
    //       this.finishLogin();
    //     }).catch((err) => {
    //       transition.abort();
    //       this.transitionTo('login', {queryParams: { errorMsg: err.message, errorCode: err.status}});
    //     }).finally(() => {
    //       this.controllerFor('application').setProperties({
    //         state: null,
    //         code: null,
    //       });
    //     });
    //     debugger;

    //   } else {

    //     let obj = {message: stateMsg, code: 'StateMismatch'};

    //     this.controllerFor('application').set('error', obj);

    //     return reject(obj);
    //   }
    // }

    function reply(err,code) {
      try {
        window.opener.window.onGithubTest(err,code);
        setTimeout(function() {
          window.close();
        },250);
        return new RSVP.promise();
      } catch(e) {
        window.close();
      }
    }
  }
});
