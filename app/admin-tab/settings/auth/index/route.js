import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  access: service(),

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
