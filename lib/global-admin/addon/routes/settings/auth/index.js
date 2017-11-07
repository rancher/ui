import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  access: service(),
  authStore: service('auth-store'),
  beforeModel: function() {
    return this.get('authStore').rawRequest({url: '/v1-auth/schemas', dataType: 'json'}).then((resp) => {
      return this.get('authStore')._bulkAdd('schema', resp.body.data);
    });
  },

  model: function() {
    var route = (this.get('access.provider')||'').toLowerCase().replace(/config$/i,'');
    if ( route === 'ldap' )
    {
      route = 'activedirectory';
    }

    if ( this.get('access.enabled') )
    {
      this.replaceWith('settings.auth.' + route);
    }
    else
    {
      this.replaceWith('settings.auth.localauth');
    }
  },
});
