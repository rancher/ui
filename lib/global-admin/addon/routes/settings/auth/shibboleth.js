import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authStore: service('auth-store'),
  model: function() {
    return this.get('authStore').find('config', null, {forceReload: true}).then(function(collection) {
      return collection;
    });
  },
});
