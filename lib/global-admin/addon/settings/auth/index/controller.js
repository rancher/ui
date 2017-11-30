import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  access: service(),

  lastRoute: 'global-admin.settings.auth.github',
  drivers: function() {

    return [
      {route: 'global-admin.settings.auth.activedirectory', label: 'Active Directory',  css: 'activedirectory', available: this.hasRecord('ldapconfig')  },
      {route: 'global-admin.settings.auth.azuread',         label: 'Azure AD',          css: 'azuread',         available: this.hasRecord('azureadconfig')  },
      {route: 'global-admin.settings.auth.github',          label: 'GitHub',            css: 'github',          available: this.hasRecord('githubconfig')  },
      {route: 'global-admin.settings.auth.localauth',       label: 'Local',             css: 'local',           available: this.hasRecord('localauthconfig')  },
      {route: 'global-admin.settings.auth.openldap',        label: 'OpenLDAP',          css: 'openldap',        available: this.hasRecord('openldapconfig')  },
      {route: 'global-admin.settings.auth.shibboleth',      label: 'Shibboleth',        css: 'shibboleth',      available: this.hasRecord('shibbolethconfig')  },
    ];
  }.property(),

  hasRecord: function(record) {
    let type = 'schema';
    let authStore = this.get('authStore');
    let userStore = this.get('userStore');

    if (userStore.hasRecordFor(type, record) || authStore.hasRecordFor(type, record)) {
      return true;
    }

    return false;
  },
});
