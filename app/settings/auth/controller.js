import Ember from 'ember';

export default Ember.ObjectController.extend({
  lastRoute: 'settings.auth.github',
  drivers: function() {
    return [
      {route: 'settings.auth.github',   label: 'GitHub',        css: 'github',     available: true  },
      {route: 'settings.auth.ldap',     label: 'LDAP',          css: 'ldap',       available: true  },
    ];
  }.property(),
});
