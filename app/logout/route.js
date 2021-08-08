import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  access: service(),

  beforeModel(transition) {
    if ( get(this, 'app.environment') === 'development' ) {
      transition.send('logout');
    } else {
      window.location.href = '/dashboard/auth/logout';
    }
  }
});
