import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model() {
    return this.get('gloablStore').find('config', null, { forceReload: true }).then((collection) => {
      return collection;
    });
  },

  resetController(controller, isExiting, transition) {
    if (isExiting && transition.targetName !== 'error') {
      controller.set('editing', false);
    }
  }
});
