import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import {
  computed, get, set, setProperties, observer
} from '@ember/object';
import { alias } from '@ember/object/computed';
import C from 'ui/utils/constants';
import { isEmpty } from '@ember/utils';

export default Mixin.create({
  intl:             service(),
  globalStore:      service(),
  settings:         service(),
  saml:             service(),
  errors:           null,
  redirectUrl:      null,
  saving:           false,
  saved:            false,
  testing:          false,
  disableAuth:      true,
  urlError:         null,
  urlWarning:       false,
  urlInvalid:       false,
  protocol:         'https://',
  authConfig:       alias('model.authConfig'),
  providerNamePath: null,
  providerName:     null,

  init() {
    this._super(...arguments);

    let serverUrl = this.settings.get(C.SETTING.SERVER_URL);

    if (this.authConfig && isEmpty(this.authConfig.rancherApiHost)) {
      set(this, 'authConfig.rancherApiHost', serverUrl);
    }
  },

  didChange: observer('authConfig.rancherApiHost', function() {
    if ( !get(this, 'authConfig.rancherApiHost') ) {
      set(this, 'authConfig.rancherApiHost', get(this, 'model.serverUrl.value'))
    }
  }),

  actions: {
    authTest(cb) {
      this.send('clearError');

      let errors = [];
      let model = get(this, 'authConfig');
      const am  = get(model, 'accessMode') || 'unrestricted';

      setProperties(model, { accessMode: am });

      if (model.id === 'shibboleth' && !isEmpty(model.openLdapConfig)) {
        ( model = this.removeOpenLdapConfigIfDefault(model) );
      }

      if (model.rancherApiHost && model.rancherApiHost === 'https://' || model.rancherApiHost === 'http://') {
        errors.push(this.intl.t('validation.required', { key: 'Rancher API Host' }));
      }

      errors = [...errors, ...model.validationErrors()];

      if ( errors.get('length') ) {
        setProperties(this, {
          errors,
          testing: false
        });

        set(model, 'enabled', false);
        cb(false);
      } else {
        set(this, 'testing', true);

        let allowedPrincipals = [];

        if (get(this, 'editing')) {
          allowedPrincipals = get(model, 'allowedPrincipalIds');
        }

        setProperties(model, {
          'enabled':             false, // It should already be, but just in case..
          'allowedPrincipalIds': allowedPrincipals,
        });

        model.save().then(() => {
          model.doAction('testAndEnable', { finalRedirectUrl: `${ window.location.origin }/verify-auth?config=${ get(this, 'providerName') }` }).then( ( resp ) => {
            get(this, 'saml').test(resp, (popupResults) => {
              if (popupResults.type === 'error') {
                this.set('errors', [popupResults.message]);
                cb(false);
              } else {
                this.send('waitAndRefresh');
              }
            });
          }).catch((err) => {
            this.set('errors', [err]);
            cb(false);
          });
        }).catch((err) => {
          this.set('errors', [err]);
          cb(false);
        });
      }
    },
  },

  apiHost: computed('authConfig.rancherApiHost', {
    get() {
      let host      = get(this, 'authConfig.rancherApiHost');

      if (host.length > 0) {
        host = host.slice(8, host.length);
      }

      return host;
    },
    set(key, value) {
      let host = '';

      if (host.indexOf(get(this, 'protocol'))) {
        host = `${ get(this, 'protocol') }${ value }`;
      } else {
        host = value;
      }

      set(this, 'authConfig.rancherApiHost', host);

      return value;
    },
  }),

  canEditConfig: computed('isEnabled', 'editing', function() {
    const { isEnabled = false, editing = false } = this;

    if (!isEnabled || editing) {
      return true;
    }

    return false;
  }),

  numUsers: computed('authConfig.allowedIdentities.@each.externalIdType', 'wasRestricted', function() {
    let type = `PROJECT.TYPE_${ get(this, 'providerName').capitalize() }_USER`;

    type = get(C, type);

    return (this.get('authConfig.allowedIdentities') || []).filterBy('externalIdType', type).get('length');
  }),

  numOrgs: computed('authConfig.allowedIdentities.@each.externalIdType', 'wasRestricted', function() {
    let type = `PROJECT.TYPE_${ get(this, 'providerName').capitalize() }_GROUP`;

    type = get(C, type);

    return (this.get('authConfig.allowedIdentities') || []).filterBy('externalIdType', type).get('length');
  }),

  removeOpenLdapConfigIfDefault(authConfig) {
    let openLdapConfig     = authConfig.openLdapConfig;
    let defaultLdapFields  = JSON.stringify(this.globalStore.createRecord({ type: 'ldapFields' }));
    let stringedAuthConfig = JSON.stringify(openLdapConfig);

    if (defaultLdapFields === stringedAuthConfig) {
      delete authConfig.openLdapConfig;
    }

    return authConfig;
  },

});
