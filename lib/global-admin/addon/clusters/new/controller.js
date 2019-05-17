import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  router: service(),

  provider: null,

  init() {
    this._super(...arguments);
    this.router.on('routeDidChange', (transition) => {
      if (transition.to && transition.to.params.provider) {
        this.set('provider', transition.to.params.provider);
      }
    })
  },
});
