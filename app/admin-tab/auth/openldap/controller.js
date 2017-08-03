import Ember from 'ember';
import ActiveDirectory from 'ui/admin-tab/auth/activedirectory/controller';

import C from 'ui/utils/constants';

export default ActiveDirectory.extend({
  providerName: 'ldap.providerName.openldap',
  isOpenLdap:   true,
  userType:     C.PROJECT.TYPE_OPENLDAP_USER,
  groupType:    C.PROJECT.TYPE_OPENLDAP_GROUP,
  ldapConfig:   Ember.computed.alias('model'),
  actions: {
    test: function() {
      this.send('clearError');

      var model = this.get('model');
      model.setProperties({
        enabled: false,
        'accessMode': 'unrestricted',
      });

      var errors = model.validationErrors();
      if ( errors.get('length') )
      {
        this.set('errors', errors);
      }
      else
      {
        this.set('testing', true);
        model.save().then(() => {
          this.send('authenticate');
        }).catch(err => {
          this.send('gotError', err);
        });
      }
    },

    authenticate: function() {
      this.send('clearError');
      var code = this.get('username')+':'+this.get('password');

      this.get('access').login(code).then(res => {
        this.send('authenticationSucceeded', res.body);
      }).catch(err => {
        this.send('gotError', err);
      });
    },

    authenticationSucceeded: function(auth) {
      this.send('clearError');
      this.set('organizations', auth.orgs);

      // Set this to true so the token will be sent with the request
      this.set('access.enabled', true);

      var model = this.get('model');
      model.setProperties({
        'enabled': true,
        'accessMode': 'unrestricted',
        'allowedIdentities': [auth.userIdentity],
      });

      model.save().then(() => {
        this.send('waitAndRefresh');
      }).catch((err) => {
        this.set('access.enabled', false);
        this.send('gotError', err);
      });
    },
  },
});
