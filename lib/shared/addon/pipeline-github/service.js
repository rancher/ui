import Service from '@ember/service';
import Util from 'ui/utils/util';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';

export default Service.extend({
  session:  service(),
  redirect: null,
  // Set by app/services/access
  hostname: null,
  scheme:   null,
  clientId: null,

  generateState() {
    var state = `${ Math.random() }`;

    get(this, 'session').set('githubState', state);

    return state;
  },

  redirectURL: function(){
    return `${ window.location.origin  }/verify-auth`;
  }.property(),

  getAuthorizeUrl(githubAuthUrl) {
    var redirect = get(this, 'redirectURL');

    redirect = redirect.split('#')[0];
    var url = Util.addQueryParams(githubAuthUrl, {
      state:        this.generateState(),
      redirect_uri: redirect
    });

    set(this, 'redirect', redirect);

    return url;
  },

  authorizeTest(githubAuthUrl, cb, neverReject = false) {
    var responded = false;

    window.onAuthTest = function(err, code) {
      if ( !responded ) {
        responded = true;
        cb(err, code);
      }
    };

    var popup = window.open(this.getAuthorizeUrl(githubAuthUrl), 'rancherAuth', Util.popupWindowOptions());
    var timer = setInterval(() => {
      if ( !popup || popup.closed ) {
        clearInterval(timer);
        if ( !responded ) {
          responded = true;
          if ( neverReject ) {
            cb();
          } else {
            cb({
              type:    'error',
              message: 'Access was not authorized'
            });
          }
        }
      }
    }, 500);
  },
});