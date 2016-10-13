import Ember from 'ember';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

// NOTE TO SELF: The model is actually the config without the shibbolethconfig and
// we just push the shibbolethconfig in to the model then save that. NOT the shibbolethconfig itself
export default Ember.Controller.extend({
  access         : Ember.inject.service(),
  settings       : Ember.inject.service(),
  session        : Ember.inject.service(),
  samlAuth       : Ember.inject.service(),
  providerName   : 'authPage.saml.providerName.saml',
  config         : Ember.computed.alias('model.shibbolethConfig'),
  errors         : null,
  confirmDisable : false,
  redirectUrl    : null,
  numUsers: function() {
    return this.get('model.allowedIdentities').filterBy('externalIdType',C.PROJECT.TYPE_SAML_USER).get('length');
  }.property('model.allowedIdentities.@each.externalIdType','wasRestricted'),

  numOrgs: function() {
    return this.get('model.allowedIdentities').filterBy('externalIdType',C.PROJECT.TYPE_SAML_GROUP).get('length');
  }.property('model.allowedIdentities.@each.externalIdType','wasRestricted'),
  actions: {
    disable: function() {

      let model = this.get('model').clone();
      model.setProperties({
        'allowedIdentities': [],
        'accessMode': 'unrestricted',
        'enabled': false,
      });

      model.save().then(() => {
        this.get('access').clearSessionKeys();
        this.set('access.enabled',false);
        this.get('samlAuth').waitAndRefresh();
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        this.set('confirmDisable', false);
      });
    },
    promptDisable: function() {
      this.set('confirmDisable', true);
      Ember.run.later(this, function() {
        this.set('confirmDisable', false);
      }, 10000);
    },

    save: function() {
      if (this.validate()) {
        this.get('model').setProperties({
          'provider'          : 'shibbolethconfig',
          'enabled'           : false, // It should already be, but just in case..
          'accessMode'        : 'unrestricted',
          'allowedIdentities' : [],
        });
        this.get('model').save().then((/*resp*/) => {
          this.get('samlAuth').getToken().then((token) => {
            this.set('redirectUrl', token.redirectUrl);
            this.send('authTest');
          });
        }).catch(err => {
            this.set('errors', [err]);
        });
      }
    },
    authTest: function() {
      var responded = false;
      window.onSAMLTest = (err) => {
        if ( !responded ) {
          responded = true;
          if (err) {
            this.set('errors', [err]);
          } else {
            this.get('samlAuth').authenticationSucceeded(this.get('model'));
          }
        }
      };

      var popup = window.open(this.get('samlAuth').buildRedirectUrl(this.get('redirectUrl'), true), 'rancherAuth', Util.popupWindowOptions());
      var timer = setInterval(() => {
        if ( !popup || popup.closed ) {
          clearInterval(timer);
          if( !responded ) {
            responded = true;
            this.set('errors', ['SAML access was not authorized']);
          }
        }
      }, 500);
    },

  },
  validate: function() {
    let model = Ember.Object.create(this.get('config'));
    let errors = [];

    if ((model.get('displayNameField')||'').trim().length === 0 ) {
      errors.push('Display Name is required');
    }
    if ((model.get('userNameField')||'').trim().length === 0 ) {
      errors.push('User Name is required');
    }
    if ((model.get('uidField')||'').trim().length === 0 ) {
      errors.push('User ID is required');
    }
    if ((model.get('groupsField')||'').trim().length === 0 ) {
      errors.push('Groups is required');
    }
    if ((model.get('displayNameField')||'').trim().length === 0 ) {
      errors.push('Display Name is required');
    }
    if ((model.get('spCert')||'').trim().length === 0 ) {
      errors.push('Certificate is required');
    }
    if ((model.get('spKey')||'').trim().length === 0 ) {
      errors.push('Key is required');
    }
    if ((model.get('idpMetadataContent')||'').trim().length === 0 ) {
      errors.push('Metadata XML is required');
    }
    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }
    else
    {
      this.set('errors', null);
    }

    return true;
  }
});
