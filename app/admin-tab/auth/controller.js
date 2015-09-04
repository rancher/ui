import Ember from 'ember';

export default Ember.ObjectController.extend({
  access: Ember.inject.service(),

  lastRoute: 'admin-tab.auth.github',
  drivers: function() {
    var store = this.get('store');
    var has = store.hasRecordFor.bind(store,'schema');

    return [
      {route: 'admin-tab.auth.github',    label: 'GitHub',        css: 'github',     available: has('githubconfig')  },
      {route: 'admin-tab.auth.ldap',      label: 'LDAP',          css: 'ldap',       available: has('ldapconfig')  },
      {route: 'admin-tab.auth.localauth', label: 'Local',         css: 'local',      available: has('localauthconfig')  },
    ];
  }.property(),
});
