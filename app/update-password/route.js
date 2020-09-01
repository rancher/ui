import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import C from 'ui/utils/constants';
import { isDevBuild } from 'shared/utils/parse-version';

export default Route.extend({
  access:      service(),
  settings:    service(),
  globalStore: service(),

  model() {
    let promises = [];

    if ( get(this, 'access.firstLogin') ) {
      promises.push(get(this, 'globalStore').find('preference'));
      promises.push(get(this, 'settings').loadAll());
    }

    return Promise.all(promises).then(() => {
      const cur = get(this, `settings.${ C.SETTING.TELEMETRY }`);
      const version = get(this, `settings.${ C.SETTING.VERSION_RANCHER }`);
      let optIn;

      if ( !version || isDevBuild(version) ) {
        // For dev builds, default to opt out
        optIn = (cur === 'in');
      } else {
        // For releases, default to opt in
        optIn = (cur !== 'out');
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
