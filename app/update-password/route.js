import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { resolve } from 'rsvp';
import C from 'ui/utils/constants';

export default Route.extend({
  access:       service(),
  settings: service(),

  model() {
    let promise;

    if ( get(this, 'access.firstLogin') ) {
      promise = get(this, 'settings').load([
        C.SETTING.VERSION_RANCHER,
        C.SETTING.TELEMETRY
      ]);
    } else {
      promise = resolve();
    }

    return promise.then(() => {
      const cur = get(this, `settings.${ C.SETTING.TELEMETRY }`);
      const version = get(this, `settings.${ C.SETTING.VERSION_RANCHER }`);
      let optIn;

      if ( version && !['dev', 'master'].includes(version) ) {
        // For releases, default to opt in
        optIn = (cur !== 'out');
      } else {
        // For master, default to opt out
        optIn = (cur === 'in');
      }

      return {
        user: get(this, 'access.me'),
        code: get(this, 'access.userCode') || '',
        optIn,
      };
    });
  },

  activate() {
    $('BODY').addClass('container-farm'); // eslint-disable-line
  },

  deactivate() {
    $('BODY').removeClass('container-farm'); // eslint-disable-line
  },

});
