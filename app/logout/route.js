import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  access: service(),

  beforeModel(transition) {
    transition.send('logout');
  }
});
