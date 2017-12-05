import Route from '@ember/routing/route';
import { inject as service } from '@ember/service'

export default Route.extend({
  model() {
//  @TODO need schemas...  return this.get('globalStore').find('account', null, {filter: {'kind_ne': ['service','agent']}, forceReload: true});
  },
});
