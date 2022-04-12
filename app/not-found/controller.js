import Controller from '@ember/controller';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  router: service(),

  actions: {
    home() {
      const target = `${ window.location.origin }/dashboard`;
      const looped = window.location.href === target;

      if (looped || get(this, 'app.environment') === 'development') {
        const router = get(this, 'router');

        router.transitionTo('authenticated');
      } else {
        window.location.href = '/dashboard';
      }
    }
  }
});
