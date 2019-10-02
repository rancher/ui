import Service, { inject as service } from '@ember/service';
import Util from 'shared/utils/util';
import { get, set } from '@ember/object';

const additionalRedirectParams = {
  response_mode: 'query',
  response_type: 'code',
  // prompt: "consent",
};

export default Service.extend({
  access:      service(),
  cookies:     service(),
  session:     service(),
  globalStore: service(),
  app:         service(),
  intl:        service(),

  testConfig(config) {
    return config.doAction('configureTest', config);
  },

  saveConfig(config, opt) {
    return config.doAction('testAndApply', opt);
  },

  login() {
    const provider     = get(this, 'access.providers').findBy('id', 'azuread');
    const authRedirect = get(provider, 'redirectUrl');
    const redirect     = Util.addQueryParams(authRedirect, additionalRedirectParams);

    window.location.href = redirect;
  },

  test(config, url, cb) {
    let responded = false;

    window.onAzureTest = (err, code) => {
      if ( !responded ) {
        let azureADConfig = config;

        responded = true;

        this.finishTest(azureADConfig, code, cb);
      }
    };

    url = Util.addQueryParams(url, additionalRedirectParams);

    const popup = window.open(url, 'rancherAuth', Util.popupWindowOptions());
    const intl = get(this, 'intl');

    const timer = setInterval(() => {
      if (popup && popup.closed ) {
        clearInterval(timer);

        if ( !responded ) {
          responded = true;

          cb({
            type:    'error',
            message: intl.t('authPage.azuread.test.authError')
          });
        }
      } else if (popup === null || typeof (popup) === 'undefined') {
        clearInterval(timer);

        if ( !responded ) {
          responded = true;

          cb({
            type:    'error',
            message: intl.t('authPage.azuread.test.popupError')
          });
        }
      }
    }, 500);
  },

  finishTest(config, code, cb) {
    const azureADConfig = config;

    set(azureADConfig, 'enabled', true);

    let out = {
      code,
      config: azureADConfig,
    };

    return this.saveConfig(config, out).then(() => {
      return get(this, 'globalStore').find('principal', null, {
        filter: {
          me:       true,
          provider: 'azuread'
        }
      }).then(( resp ) => {
        let aps = get(out, 'config.allowedPrincipalIds') ? get(out, 'config.allowedPrincipalIds') : set(out, 'config.allowedPrincipalIds', []);

        let me = resp.find( (p) => {
          return get(p, 'me') && get(p, 'provider') === 'azuread';// TODO  filters do not work but craig knows
        });

        if (!aps.includes(get(me, 'id'))) {
          aps.pushObject(get(me, 'id'));
        }

        return azureADConfig.save().then(() => {
          window.location.href = window.location.href; // eslint-disable-line no-self-assign
        });
      });
    }).catch((err) => cb(err));
  },
});
