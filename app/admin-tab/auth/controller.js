import Ember from 'ember';

export default Ember.Controller.extend({
  access: Ember.inject.service(),

  lastRoute: 'admin-tab.auth.github',
  drivers: function() {

    return [
      {route: 'admin-tab.auth.activedirectory', label: 'Active Directory',  css: 'activedirectory', available: this.hasRecord('ldapconfig')  },
      {route: 'admin-tab.auth.azuread',         label: 'Azure AD',          css: 'azuread',         available: this.hasRecord('azureadconfig')  },
      {route: 'admin-tab.auth.github',          label: 'GitHub',            css: 'github',          available: this.hasRecord('githubconfig')  },
      {route: 'admin-tab.auth.localauth',       label: 'Local',             css: 'local',           available: this.hasRecord('localauthconfig')  },
      {route: 'admin-tab.auth.openldap',        label: 'OpenLDAP',          css: 'openldap',        available: this.hasRecord('openldapconfig')  },
      {route: 'admin-tab.auth.shibboleth',      label: 'Shibboleth',        css: 'shibboleth',      available: this.hasRecord('shibbolethconfig')  },
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
