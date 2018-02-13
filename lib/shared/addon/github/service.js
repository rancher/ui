import { Promise as EmberPromise } from 'rsvp';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import Util from 'shared/utils/util';
import { get } from '@ember/object';

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

  getAuthorizeUrl: function(test) {
    var redirect = get(this, 'session').get(C.SESSION.BACK_TO) || window.location.href;

    if ( test )
    {
      redirect = Util.addQueryParam(redirect, 'isTest', 1);
    }

    var url = Util.addQueryParams(get(this, 'access.token.redirectUrl'), {
      state: this.generateState(),
      redirect_uri: redirect
    });

    return url;
  },

  authorizeRedirect: function() {
    window.location.href = this.getAuthorizeUrl();
  },

  authorizeTest: function(cb) {
    var responded = false;
    window.onGithubTest = function(err,code) {
      if ( !responded ) {
        responded = true;
        cb(err,code);
      }
    };

    // var popup = window.open(this.getAuthorizeUrl(true), 'rancherAuth', Util.popupWindowOptions());
    let redirect = `${get(this, 'redirectUrl')}&redirect_uri=${window.location.origin}?isTest=true&state=${this.generateState()}`;
    var popup = window.open(redirect, 'rancherAuth', Util.popupWindowOptions());
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
