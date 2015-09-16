import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

export default Ember.Service.extend({
  cookies: Ember.inject.service(),
  session: Ember.inject.service(),

  // Set by app/services/access
  hostname: null,
  clientId: null,

  generateState: function() {
    var state = Math.random()+'';
    this.get('session').set('githubState', state);
    return state;
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

    var url = Util.addQueryParams('https://' + (this.get('hostname') || C.GITHUB.DEFAULT_HOSTNAME) + C.GITHUB.AUTH_PATH, {
      client_id: this.get('clientId'),
      state: this.generateState(),
      scope: C.GITHUB.SCOPE,
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
      if ( !responded )
      {
        responded = true;
        cb(err,code);
      }
    };

    var popup = window.open(this.getAuthorizeUrl(true), 'rancherAuth', Util.popupWindowOptions());
    popup.onBeforeUnload = function() {
      if( !responded )
      {
        responded = true;
        cb('Github access was not authorized');
      }
    };
  },
});
