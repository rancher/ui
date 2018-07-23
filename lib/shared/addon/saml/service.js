import {
  set, get, observer
} from '@ember/object';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import Util from 'shared/utils/util';
import { denormalizeName } from 'shared/settings/service';

export default Service.extend({
  globalStore:   service(),
  session:       service(),
  access:        service(),
  app:           service(),

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

  authorizeRedirect(url) {
    window.location.href = url;
  },

  test(config, cb) {

    let responded = false;

    debugger;
    window.onPingTest = (err, code) => {

      debugger;
      if ( !responded ) {

        let authConfig = config;

        responded = true;

        this.finishTest(authConfig, code, cb);

      }

    };

    // let url = Util.addQueryParams(`${ window.location.origin }/verify-auth`, { config: 'ping', });
    let url = get(config, 'idpRedirectUrl');

    let popup = window.open(url, 'rancherAuth', Util.popupWindowOptions());

    let timer = setInterval(function() {

      if (popup && popup.closed ) {

        clearInterval(timer);

        if ( !responded ) {

          responded = true;
          cb({
            type:    'error',
            message: get(this, 'intl').t('authPage.github.test.authError')
          });

        }

      } else if (popup === null || typeof (popup) === 'undefined') {

        clearInterval(timer);

        if ( !responded ) {

          responded = true;

          cb({
            type:    'error',
            message: get(this, 'intl').t('authPage.github.test.popupError')
          });

        }

      }

    }, 500);

  },
  // authenticationSucceeded(model) {
  //   let url = window.location.href;

  //   model = model.clone();
  //   model.setProperties({
  //     'enabled':           true,
  //     'accessMode':        'unrestricted',
  //     'allowedIdentities': [],
  //   });


  //   model.save().then(() => {

  //     // for some reason we can't get past here because we've set auth true?
  //     return this.get('globalStore').find('setting', denormalizeName(C.SETTING.API_HOST)).then((setting) => {
  //       if ( setting.get('value') ) {
  //         this.waitAndRefresh(url);
  //       } else {
  //         // Default the api.host so the user won't have to set it in most cases
  //         if ( window.location.hostname === 'localhost' ) {
  //           this.waitAndRefresh(url);
  //         } else {
  //           setting.set('value', window.location.origin);

  //           return setting.save().then(() => {
  //             this.waitAndRefresh(url);
  //           });
  //         }
  //       }
  //     });
  //   }).catch(() => {
  //     this.set('access.enabled', false);
  //   });
  // },
  finishTest(config, code, cb) {

    const authConfig = config;

    set(authConfig, 'enabled', true);

    let out = {
      code,
      enabled:      true,
      githubConfig: authConfig,
      description:  C.SESSION.DESCRIPTION,
      ttl:          C.SESSION.TTL,
    };

    const allowedPrincipalIds = get(config, 'allowedPrincipalIds') || [];

    return this.saveConfig(config, out).then(() => {

      let found = false;
      const myPIds = get(this, 'access.me.principalIds');

      myPIds.forEach( (id) => {

        if (allowedPrincipalIds.indexOf(id) >= 0) {

          found = true;

        }

      });

      if ( !found && !allowedPrincipalIds.length) {

        allowedPrincipalIds.pushObject(get(this, 'access.principal.id'));

      }

      return authConfig.save().then(() => {

        window.location.href = window.location.href;

      });

    })
      .catch((err) => {

        cb(err);

      });

  },
});
