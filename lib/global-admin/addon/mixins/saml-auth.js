import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import {
  computed, get, set, setProperties, observer
} from '@ember/object';
import { alias } from '@ember/object/computed';
import C from 'ui/utils/constants';

export default Mixin.create({
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

  didChange: observer('authConfig.rancherApiHost', function() {
    if ( !get(this, 'authConfig.rancherApiHost') ) {
      set(this, 'authConfig.rancherApiHost', get(this, 'model.serverUrl.value'))
    }
  }),

  actions: {
    authTest(cb) {
      this.send('clearError');

      const model = get(this, 'authConfig');
      const am    = get(model, 'accessMode') || 'unrestricted';

      setProperties(model, { accessMode: am });

      const errors = model.validationErrors();

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
      let host = get(this, 'authConfig.rancherApiHost') || '';

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

});
