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
    set(this, 'landing', 'ember');
  },

  actions: {
    setView(which) {
      set(this, 'landing', which);
    },
  },

  firstLogin: computed('first', 'access.firstLogin', function() {
    if ( this.first !== undefined ) {
      return true;
    }

    return get(this, 'access.firstLogin');
  }),

  currentPassword: computed('', 'access.userCode.password', 'firstLogin', function() {
    return get(this, 'access.userCode.password') || (this.firstLogin ? 'admin' : null);
  }),

  complete(success) {
    const landing = this.landing;
    let router = this.router;

    if (success) {
      if ( this.firstLogin ) {
        const value = get(this, 'model.optIn') ? 'in' : 'out';

        this.settings.set(C.SETTING.TELEMETRY, value);
        this.settings.set(C.SETTING.EULA_AGREED, (new Date()).toISOString());
        this.settings.set(C.SETTING.UI_DEFAULT_LANDING, landing);
        this.prefs.set(C.PREFS.LANDING, landing);
      }

      this.access.set('firstLogin', false);
      this.access.set('userCode', null);

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
