import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  settings: service(),
  scope:    service(),

  model() {
    return get(this, 'scope').startSwitchToGlobal(false);
  },

  setupController(/* controller, model*/) {
    this._super(...arguments);
    get(this, 'scope').finishSwitchToGlobal();
  },

  resetController(controller, isExiting /* , transition*/ ) {
    if (isExiting) {
      controller.set('error', null);
    }
  }
});
