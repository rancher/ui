import { Promise as EmberPromise } from 'rsvp';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import Util from 'shared/utils/util';

export default Service.extend({
  access: service(),
  cookies  : service(),
  session  : service(),
  userStore: service(),

  // Set by app/services/access
  hostname : null,
  scheme   : null,
  clientId : null,

  generateState: function() {
    var state = Math.random()+'';
    this.get('session').set('githubState', state);
    return state;
  },

  getToken: function() {
    return new EmberPromise((resolve, reject) => {
      this.get('userStore').rawRequest({
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
    var expected = this.get('session.githubState');
    return actual && expected === actual;
  },

  getAuthorizeUrl: function(test) {
    var redirect = this.get('session').get(C.SESSION.BACK_TO) || window.location.href;

    if ( test )
    {
      redirect = Util.addQueryParam(redirect, 'isTest', 1);
    }

    var url = Util.addQueryParams(this.get('access.token.redirectUrl'), {
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

    var popup = window.open(this.getAuthorizeUrl(true), 'rancherAuth', Util.popupWindowOptions());
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
