import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set, get, computed } from '@ember/object';
import C from 'ui/utils/constants';

export default Controller.extend({
  router:      service(),
  access:      service(),
  settings:    service(),
  globalStore: service(),
  prefs:       service(),

  queryParams: ['first'],

  showCurrent:  null,
  agreedToEula: false,
  landing:      null,

  init() {
    this._super(...arguments);
    set(this, 'showCurrent', !get(this, 'access.userCode.password'));
    set(this, 'landing', get(this, `setting.${ C.SETTING.UI_DEFAULT_LANDING }`));
  },

  actions: {
    setView(which) {
      set(this, 'landing', which);
    },
  },

  firstLogin: computed('first', 'access.firstLogin', function() {
    if ( get(this, 'first') !== undefined ) {
      return true;
    }

    return get(this, 'access.firstLogin');
  }),

  currentPassword: computed('', function() {
    return get(this, 'access.userCode.password') || null;
  }),

  complete(success) {
    const landing = get(this, 'landing');
    let router = get(this, 'router');

    if (success) {
      if ( get(this, 'firstLogin') ) {
        const value = get(this, 'model.optIn') ? 'in' : 'out';

        get(this, 'settings').set(C.SETTING.TELEMETRY, value);
        get(this, 'settings').set(C.SETTING.EULA_AGREED, (new Date()).toISOString());
        get(this, 'settings').set(C.SETTING.UI_DEFAULT_LANDING, landing);
        get(this, 'prefs').set(C.PREFS.LANDING, landing);
      }

      get(this, 'access').set('firstLogin', false);
      get(this, 'access').set('userCode', null);

      if ( landing === 'vue' ) {
        let link = '/dashboard';

        if ( get(this, 'app.environment') === 'development' ) {
          link = 'https://localhost:8005/';
        }

        window.location.href = link;

        return;
      }

      router.replaceWith('authenticated');
    }
  },
});
