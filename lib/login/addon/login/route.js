import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import Route from '@ember/routing/route';
import C from 'shared/utils/constants';

export default Route.extend({
  access: service(),
  cookies: service(),
  globalStore: service(),
  language: service('user-language'),

  firstLogin: null,

  activate() {
    $('BODY').addClass('container-farm');
  },

  deactivate() {
    $('BODY').removeClass('container-farm');
  },

  beforeModel() {
    this._super(...arguments);
    return get(this, 'language').initUnauthed().then(() => {
      return this.get('globalStore').request({url: `settings/${C.SETTING.FIRST_LOGIN}`}).then((res) =>{
        set(this, 'firstLogin', (res.value+'') === 'true');
      }).catch(() => {
        set(this, 'firstLogin', false);
      });
    });
  },

  model() {
    const firstLogin = get(this, 'firstLogin');
    set(this, 'access.firstLogin', firstLogin);

    if ( firstLogin ) {
      const code = {
        username: 'admin',
        password: 'admin',
      };

      return get(this, 'access').login('local',code).then((user) => {
        get(this, 'cookies').setWithOptions(C.COOKIE.USERNAME, 'admin', {expire: 365, secure: 'auto'});

        set(this, 'access.userCode', code);
        return {
          firstLogin: true,
          user: user,
          changePassword: true,
          code: code,
        }
      }).catch(() => {
        return {
          user: null,
          changePassword: false,
          code: null,
        };
      });
    } else {
      return {
        firstLogin: false,
        user: null,
        changePassword: false,
        code: null,
      };
    }
  },

  afterModel(model) {
    if ( get(model, 'firstLogin') ) {
      this.transitionToExternal('update-password');
    }
  },

  resetController(controller, isExisting /*, transition*/ ) {
    if (isExisting) {
      controller.set('changePassword', false);
      controller.set('waiting',false);
    }
  }
});
