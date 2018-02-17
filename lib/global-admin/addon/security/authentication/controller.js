import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
  access: service(),
  globalStore: service(),

  lastRoute: 'global-admin.security.authentication.github',
  drivers: computed(function() {
    return [
      // {route: 'global-admin.security.authentication.activedirectory', label: 'Active Directory',  css: 'activedirectory', available: this.hasRecord('ldapconfig')  },
      // {route: 'global-admin.security.authentication.azuread',         label: 'Azure AD',          css: 'azuread',         available: this.hasRecord('azureadconfig')  },
      {route: 'security.authentication.github',          label: 'GitHub',            css: 'github',          available: this.hasRecord('githubconfig')  },
      // {route: 'security.authentication.localauth',       label: 'Local',             css: 'local',           available: this.hasRecord('localconfig')  }, // always on
      // {route: 'global-admin.security.authentication.openldap',        label: 'OpenLDAP',          css: 'openldap',        available: this.hasRecord('openldapconfig')  },
      // {route: 'global-admin.security.authentication.shibboleth',      label: 'Shibboleth',        css: 'shibboleth',      available: this.hasRecord('shibbolethconfig')  },
    ];
  }),

  hasRecord: function(record) {
    let type = 'schema';
    let store = this.get('globalStore');

    return store.hasRecordFor(type, record);
  },
});
