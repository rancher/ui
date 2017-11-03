import Route from '@ember/routing/route';
import { inject as service } from '@ember/service'

export default Route.extend({
  userStore: service('user-store'),
  model: function() {
    return this.get('userStore').find('account', null, {filter: {'kind_ne': ['service','agent']}, forceReload: true});
  },
});
