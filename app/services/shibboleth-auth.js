import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { denormalizeName } from 'ui/services/settings';

export default Ember.Service.extend({
  userStore: Ember.inject.service('user-store'),
  session: Ember.inject.service(),
  access: Ember.inject.service(),
  hasToken: null,
  parseIdentity: Ember.observer('hasToken', function() {
    let locToken = this.get('hasToken');
    if (locToken) {
      let userIdent = locToken.userIdentity;
      this.set(`session.${C.SESSION.IDENTITY}`, userIdent);
    }
  }),
  getToken: function() {
    return new Ember.RSVP.Promise((resolve, reject) => {
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
  buildRedirectUrl: function(url, test=false) {
    let redirect = url;
    let qp =  {
      redirectBackBase: window.location.origin,
      redirectBackPath: '/login/shibboleth-auth/',
    };

    if ( test ) {
      qp.redirectBackPath = `${qp.redirectBackPath}?shibbolethTest=1`;
    }

    return Util.addQueryParams(redirect, qp);
  },
  waitAndRefresh: function(url) {
    $('#loading-underlay, #loading-overlay').removeClass('hide').show();
    setTimeout(function() {
      window.location.href = url || window.location.href;
    }, 1000);
  },
  authorizeRedirect: function(url) {
    window.location.href = url;
  },
  authenticationSucceeded: function(model) {
    let url = window.location.href;

    model = model.clone();
    model.setProperties({
      'enabled'           :  true,
      'accessMode'        : 'restricted',
      'allowedIdentities' : [],
    });


    model.save().then(() => {

      // for some reason we can't get past here because we've set auth true?
      return this.get('userStore').find('setting', denormalizeName(C.SETTING.API_HOST)).then((setting) => {
        if ( setting.get('value') ) {
          this.waitAndRefresh(url);
        } else {
          // Default the api.host so the user won't have to set it in most cases
          if ( window.location.hostname === 'localhost' ) {
            this.waitAndRefresh(url);
          } else {
            setting.set('value', window.location.origin);
            return setting.save().then(() => {
              this.waitAndRefresh(url);
            });
          }
        }
      });
    }).catch(() => {
      this.set('access.enabled', false);
    });
  },
});
