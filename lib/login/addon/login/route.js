import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import Route from '@ember/routing/route';
import C from 'shared/utils/constants';

export default Route.extend({
  access: service(),
  cookies: service(),
  language: service('user-language'),

  activate() {
    $('BODY').addClass('container-farm');
  },

  deactivate() {
    $('BODY').removeClass('container-farm');
  },

  beforeModel() {
    this._super(...arguments);
    return get(this, 'language').initUnauthed();
  },

  model() {
    const newInstall = false; // @TODO some way to get this from the API

    if ( newInstall ) {
      const code = {
        username: 'admin',
        password: 'admin',
      };

      return get(this, 'access').login('local',code).then((user) => {
        get(this, 'cookies').setWithOptions(C.COOKIE.USERNAME, 'admin', {expire: 365, secure: 'auto'});

        return {
          newInstall: true,
          user: user,
          changePassword: true,
          code: code,
        }
      }).catch(() => {
        return {
          newInstall: true,
          user: null,
          changePassword: false,
          code: null,
        };
      });
    } else {
      return {
        newInstall: false,
        user: null,
        changePassword: false,
        code: null,
      };
    }
  },
});
