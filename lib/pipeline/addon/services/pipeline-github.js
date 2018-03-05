import Service from '@ember/service';
import Util from 'ui/utils/util';
import { inject as service } from '@ember/service';

export default Service.extend({
  session  : service(),
  redirect: null,
  // Set by app/services/access
  hostname : null,
  scheme   : null,
  clientId : null,

  generateState: function() {
    var state = Math.random()+'';
    this.get('session').set('githubState', state);
    return state;
  },

  stateMatches: function(actual) {
    var expected = this.get('session.githubState');
    return actual && expected === actual;
  },
  redirectURL: function(){
    return window.location.origin + '/verify-auth';
  }.property(),
  getAuthorizeUrl: function(githubAuthUrl,test) {
    var redirect = this.get('redirectURL');
    redirect = redirect.split('#')[0];
    if ( test )
    {
      redirect = Util.addQueryParam(redirect, 'isTest', 1);
    }
    var url = Util.addQueryParams(githubAuthUrl, {
      state: this.generateState(),
      redirect_uri: redirect
    });
    this.set('redirect', redirect);
    return url;
  },

  authorizeRedirect: function() {
    window.location.href = this.getAuthorizeUrl();
  },

  authorizeTest: function(githubAuthUrl,cb) {
    var responded = false;
    window.onGithubTest = function(err,code) {
      if ( !responded ) {
        responded = true;
        cb(err,code);
      }
    };

    var popup = window.open(this.getAuthorizeUrl(githubAuthUrl,true), 'rancherAuth', Util.popupWindowOptions());
    var timer = setInterval(function() {
      if ( !popup || popup.closed ) {
        clearInterval(timer);
        if( !responded ) {
          responded = true;
          cb({type: 'error', message: 'Access was not authorized'});
        }
      }
    }, 500);
  },
});
