import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  access: service(),

  beforeModel(transition) {
    this._super(...arguments);
    transition.send('logout');
  }
});
