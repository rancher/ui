import { get, setProperties } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import Util from 'shared/utils/util';

export default Service.extend({
  globalStore:   service(),
  session:       service(),
  access:        service(),
  app:           service(),
  intl:          service(),

  login(providerName) {
    const finalUrl = window.location.origin;
    const provider     = get(this, 'access.providers').findBy('id', providerName);

    return provider.doAction('login', { finalRedirectUrl: finalUrl }).then( ( resp ) => {
      return window.location.href = resp.idpRedirectUrl;
    }).catch(() => {
      return {
        type:    'error',
        message: get(this, 'intl').t('authPage.saml.authError')
      }
    });
  },

  test(config, cb) {
    let responded = false;

    window.onAuthTest = (err, code) => {
      if ( !responded ) {
        let authConfig = code;

        responded = true;

        this.finishTest(authConfig, code, cb);
      }
    };

    let url   = get(config, 'idpRedirectUrl');
    let popup = window.open(url, 'rancherAuth', Util.popupWindowOptions());

    let timer = setInterval(function() {
      if (popup && popup.closed ) {
        clearInterval(timer);

        if ( !responded ) {
          responded = true;

          cb({
            type:    'error',
            message: get(this, 'intl').t('authPage.saml.authError')
          });
        }
      } else if (popup === null || typeof (popup) === 'undefined') {
        clearInterval(timer);

        if ( !responded ) {
          responded = true;

          cb({
            type:    'error',
            message: get(this, 'intl').t('authPage.saml.popupError')
          });
        }
      }
    }, 500);
  },

  finishTest(config, code, cb) {
    const authConfig          = config;
    const am                  = get(authConfig, 'accessMode') || 'unrestricted';
    const allowedPrincipalIds = get(authConfig, 'allowedPrincipalIds') || [];
    const myPIds              = get(this, 'access.me.principalIds');
    let found                 = false;

    myPIds.forEach( (id) => {
      if (allowedPrincipalIds.indexOf(id) >= 0) {
        found = true;
      }
    });

    if ( !found && !allowedPrincipalIds.length) {
      allowedPrincipalIds.pushObject(get(this, 'access.principal.id'));
    }

    setProperties(authConfig, {
      allowedPrincipalIds,
      enabled:    true,
      accessMode: am,
    });


    return authConfig.save().then(() => {
      window.location.href = window.location.href;
    }).catch((err) => {
      cb(err);
    });
  },
});
