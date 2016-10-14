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
      this.replaceWith('admin-tab.auth.' + route);
    }
    else
    {
      this.replaceWith('admin-tab.auth.github');
    }
  },
});
