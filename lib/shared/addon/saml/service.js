import { get, setProperties } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import Util from 'shared/utils/util';

export default Service.extend({
  globalStore:   service(),
  session:       service(),
  access:        service(),
  app:           service(),
  intl:          service(),

  login(providerName, requestId, publicKey, responseType) {
    const finalUrl = window.location.origin;
    const provider     = get(this, 'access.providers').findBy('id', providerName);
    const args = {
      finalRedirectUrl: finalUrl,
      requestId,
      publicKey,
      responseType
    };

    return provider.doAction('login', args).then( ( resp ) => {
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
      if (err) {
        responded = true;

        cb({
          type:    'error',
          message: err
        });
      } else if ( !responded ) {
        let authConfig = code;

        responded = true;

        this.finishTest(authConfig, code, cb);
      }
    };

    let url   = get(config, 'idpRedirectUrl');
    let popup = window.open(url, 'rancherAuth', Util.popupWindowOptions());

    const intl = get(this, 'intl');

    let timer = setInterval(() => {
      if (popup && popup.closed ) {
        clearInterval(timer);

        if ( !responded ) {
          responded = true;

          cb({
            type:    'error',
            message: intl.t('authPage.saml.authError')
          });
        }
      } else if (popup === null || typeof (popup) === 'undefined') {
        clearInterval(timer);

        if ( !responded ) {
          responded = true;

          cb({
            type:    'error',
            message: intl.t('authPage.saml.popupError')
          });
        }
      }
    }, 500);
  },

  finishTest(config, code, cb) {
    const authConfig          = config;
    const am                  = get(authConfig, 'accessMode') || 'unrestricted';

    setProperties(authConfig, {
      enabled:    true,
      accessMode: am,
    });


    return authConfig.save().then(() => {
      window.location.href = window.location.href; // eslint-disable-line no-self-assign
    }).catch((err) => {
      cb(err);
    });
  },
});
