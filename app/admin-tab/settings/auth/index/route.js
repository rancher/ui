import Ember from 'ember';

export default Ember.Route.extend({
  access: Ember.inject.service(),

  model: function() {
    var route = (this.get('access.provider')||'').toLowerCase().replace(/config$/i,'');
    if ( route === 'ldap' )
    {
      route = 'activedirectory';
    }

    if ( this.get('access.enabled') )
    {
      this.replaceWith('global-admin.settings.auth.' + route);
    }
    else
    {
      this.replaceWith('global-admin.settings.auth.localauth');
    }
  },
});
