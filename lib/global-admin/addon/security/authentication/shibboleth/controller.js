import EmberObject from '@ember/object';
import { later } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Controller.extend({
  access:         service(),
  settings:       service(),
  session:        service(),
  shibbolethAuth: service(),
  providerName:   'authPage.shibboleth.providerName.shibboleth',
  errors:         null,
  confirmDisable: false,
  redirectUrl:    null,
  saving:         false,
  saved:          false,
  testing:        false,
  disableAuth:    true,
  config:         alias('model.shibbolethConfig'),
  actions:        {
    disable() {
      let model = this.get('model').clone();

      model.setProperties({
        'allowedIdentities': [],
        'accessMode':        'unrestricted',
        'enabled':           false,
      });

      model.save().then(() => {
        this.get('shibbolethAuth').waitAndRefresh();
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        this.set('confirmDisable', false);
      });
    },
    promptDisable() {
      this.set('confirmDisable', true);
      later(this, function() {
        this.set('confirmDisable', false);
      }, 10000);
    },

    save() {
      if (this.validate()) {
        this.set('saving', true);
        this.get('model').setProperties({
          'provider':          'shibbolethconfig',
          'enabled':           false, // It should already be, but just in case..
          'accessMode':        'unrestricted',
          'allowedIdentities': [],
        });
        this.get('model').save().then((/* resp*/) => {
          this.get('shibbolethAuth').getToken().then((token) => {
            this.setProperties({
              saving:      false,
              saved:       true,
              disableAuth: false,
              redirectUrl: token.redirectUrl
            });
            this.get('access').set('token', token);
          });
        }).catch((err) => {
          this.set('errors', [err]);
        });
      }
    },
    authTest() {
      var responded = false;

      this.set('testing', true);
      window.onShibbolethTest = (err) => {
        if ( !responded ) {
          responded = true;
          if (err) {
            this.set('errors', [err]);
          } else {
            this.set('testing', false);
            this.get('shibbolethAuth').authenticationSucceeded(this.get('model'));
          }
        }
      };

      var popup = window.open(this.get('shibbolethAuth').buildRedirectUrl(this.get('redirectUrl'), true), 'rancherAuth', Util.popupWindowOptions());
      var timer = setInterval(() => {
        if ( !popup || popup.closed ) {
          clearInterval(timer);
          if ( !responded ) {
            responded = true;
            this.set('testing', false);
            this.set('errors', ['Shibboleth access was not authorized']);
          }
        }
      }, 500);
    },

  },
  numUsers:       function() {
    return (this.get('model.allowedIdentities') || []).filterBy('externalIdType', C.PROJECT.TYPE_SHIBBOLETH_USER).get('length');
  }.property('model.allowedIdentities.@each.externalIdType', 'wasRestricted'),

  numOrgs: function() {
    return (this.get('model.allowedIdentities') || []).filterBy('externalIdType', C.PROJECT.TYPE_SHIBBOLETH_GROUP).get('length');
  }.property('model.allowedIdentities.@each.externalIdType', 'wasRestricted'),
  validate() {
    let model = EmberObject.create(this.get('config'));
    let errors = [];

    if ((model.get('displayNameField') || '').trim().length === 0 ) {
      errors.push('Display Name is required');
    }
    if ((model.get('userNameField') || '').trim().length === 0 ) {
      errors.push('User Name is required');
    }
    if ((model.get('uidField') || '').trim().length === 0 ) {
      errors.push('User ID is required');
    }
    if ((model.get('groupsField') || '').trim().length === 0 ) {
      errors.push('Groups is required');
    }
    if ((model.get('displayNameField') || '').trim().length === 0 ) {
      errors.push('Display Name is required');
    }
    if ((model.get('spCert') || '').trim().length === 0 ) {
      errors.push('Certificate is required');
    }
    if ((model.get('spKey') || '').trim().length === 0 ) {
      errors.push('Key is required');
    }
    if ((model.get('idpMetadataContent') || '').trim().length === 0 ) {
      errors.push('Metadata XML is required');
    }
    if ( errors.length ) {
      this.set('errors', errors.uniq());

      return false;
    } else {
      this.set('errors', null);
    }

    return true;
  }
});
