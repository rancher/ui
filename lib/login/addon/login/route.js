import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import Route from '@ember/routing/route';
import C from 'shared/utils/constants';

export default Route.extend({
  access:   service(),
  cookies:  service(),
  language: service('user-language'),

  beforeModel() {
    this._super(...arguments);

    return get(this, 'language').initUnauthed();
  },

  model() {
    const firstLogin = get(this, 'access.firstLogin');

    if ( firstLogin ) {
      const code = {
        username: 'admin',
        password: 'admin',
      };

      return get(this, 'access').login('local', code).then((/* user*/) => {
        get(this, 'cookies').setWithOptions(C.COOKIE.USERNAME, 'admin', {
          expire: 365,
          secure: 'auto'
        });
        set(this, 'access.userCode', code);
        this.transitionToExternal('update-password');
      }).catch(() => {
        return {
          firstLogin:     true,
          user:           null,
          changePassword: false,
          code:           null,
        };
      });
    } else {
      return {
        firstLogin:     false,
        user:           null,
        changePassword: false,
        code:           null,
      };
    }
  },

  resetController(controller, isExisting /* , transition*/ ) {
    if (isExisting) {
      controller.setProperties({
        changePassword:    false,
        waiting:           false,
        adWaiting:         false,
        shibbolethWaiting: false,
        localWaiting:      false,
      })
    }
  },
  activate() {
    $('BODY').addClass('container-farm'); // eslint-disable-line
  },

  deactivate() {
    $('BODY').removeClass('container-farm'); // eslint-disable-line
  },

});
