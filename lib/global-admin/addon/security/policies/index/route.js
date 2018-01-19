import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model() {
    return this.get('globalStore').find('podSecurityPolicyTemplate');
  },
});
