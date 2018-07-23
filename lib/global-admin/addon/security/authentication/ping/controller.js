import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import {
  computed, get, set, setProperties
} from '@ember/object';
import AuthMixin from 'global-admin/mixins/authentication';
import { alias } from '@ember/object/computed';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';
import { later } from '@ember/runloop';

export default Controller.extend(AuthMixin, {
  access:         service(),
  settings:       service(),
  session:        service(),
  saml:           service(),
  providerName:   'authPage.saml.providerName.ping',
  errors:         null,
  confirmDisable: false,
  redirectUrl:    null,
  saving:         false,
  saved:          false,
  testing:        false,
  disableAuth:    true,
  config:         alias('model.authConfig'),

  numUsers: computed('config.allowedIdentities.@each.externalIdType', 'wasRestricted', function() {
    return (this.get('config.allowedIdentities') || []).filterBy('externalIdType', C.PROJECT.TYPE_PING_USER).get('length');
  }),

  numOrgs: computed('config.allowedIdentities.@each.externalIdType', 'wasRestricted', function() {
    return (this.get('config.allowedIdentities') || []).filterBy('externalIdType', C.PROJECT.TYPE_PING_GROUP).get('length');
  }),

  actions: {
    authTest() {
      this.send('clearError');

      const model = get(this, 'config');
      const am    = get(model, 'accessMode') || 'unrestricted';

      setProperties(model, { accessMode: am, });

      const errors = model.validationErrors();

      if ( errors.get('length') ) {

        setProperties(this, {
          errors,
          testing: false
        })
        set(model, 'enabled', false);

      } else {

        // set(model, 'enabled', true);
        set(this, 'testing', true);

        setProperties(model, {
          'provider':          'pingconfig',
          'enabled':           false, // It should already be, but just in case..
          'accessMode':        'unrestricted',
          'allowedIdentities': [],
        });

        model.save().then(() => {
          model.doAction('testAndEnable', { finalRedirectUrl: `${ window.location.origin }/verify-auth?config=ping` }).then( resp => {
            get(this, 'saml').test(resp, (err, data) => {
              data;
              debugger;
            })
          })
        }).catch((err) => {
          this.set('errors', [err]);
        });
      }
    },
  },
});
