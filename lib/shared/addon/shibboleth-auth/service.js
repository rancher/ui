import { Promise as EmberPromise } from 'rsvp';
import { observer } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import Util from 'shared/utils/util';
import { denormalizeName } from 'shared/settings/service';

export default Service.extend({
  globalStore:   service(),
  session:       service(),
  access:        service(),
  app:           service(),
  hasToken:      null,
  parseIdentity: observer('hasToken', function() {
    let locToken = this.get('hasToken');

    if (locToken) {
      let userIdent = locToken.userIdentity;

      this.set(`session.${ C.SESSION.IDENTITY }`, userIdent);
    }
  }),
  getToken() {
    return new EmberPromise((resolve, reject) => {
      this.get('globalStore').rawRequest({ url: 'token', })
        .then((xhr) => {
          resolve(xhr.body.data[0]);

          return ;
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  buildRedirectUrl(url, test = false) {
    let redirect = url;
    let qp =  {
      redirectBackBase: window.location.origin,
      redirectBackPath: '/login/shibboleth-auth/',
    };

    if ( test ) {
      qp.redirectBackPath = `${ qp.redirectBackPath }?shibbolethTest=1`;
    }

    return Util.addQueryParams(redirect, qp);
  },
  waitAndRefresh(url) {
    $('#loading-underlay, #loading-overlay').removeClass('hide').show();  // eslint-disable-line
    setTimeout(() => {
      window.location.href = url || window.location.href;
    }, 1000);
  },
  authorizeRedirect(url) {
    window.location.href = url;
  },
  authenticationSucceeded(model) {
    let url = window.location.href;

    model = model.clone();
    model.setProperties({
      'enabled':           true,
      'accessMode':        'restricted',
      'allowedIdentities': [],
    });


    model.save().then(() => {
      // for some reason we can't get past here because we've set auth true?
      return this.get('globalStore').find('setting', denormalizeName(C.SETTING.API_HOST)).then((setting) => {
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
