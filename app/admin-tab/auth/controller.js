import Ember from 'ember';

export default Ember.Controller.extend({
  access: Ember.inject.service(),

  lastRoute: 'admin-tab.auth.github',
  drivers: function() {
    var userStore = this.get('userStore');
    var has = userStore.hasRecordFor.bind(userStore,'schema');

    return [
      {route: 'admin-tab.auth.activedirectory', label: 'Active Directory',  css: 'activedirectory', available: has('ldapconfig')  },
      {route: 'admin-tab.auth.github',          label: 'GitHub',            css: 'github',          available: has('githubconfig')  },
      {route: 'admin-tab.auth.localauth',       label: 'Local',             css: 'local',           available: has('localauthconfig')  },
      {route: 'admin-tab.auth.openldap',        label: 'OpenLDAP',          css: 'openldap',        available: has('openldapconfig')  },
    ];
  }.property(),
});
