import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import C from 'ui/utils/constants';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  resourceType: 'adfsconfig',

  model() {
    const gs = get(this, 'globalStore');

    return hash({
      authConfig: gs.find('authconfig', 'adfs', { forceReload: true }),
      principals: gs.all('principal'),
      serverUrl:  gs.find('setting', C.SETTING.SERVER_URL)
    });
  },

  resetController(controller, isExiting, transition) {
    if (isExiting && transition.targetName !== 'error') {
      controller.set('editing', false);
    }
  }
});
