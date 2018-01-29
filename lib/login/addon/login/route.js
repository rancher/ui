import { inject as service } from '@ember/service';
import { get, setProperties } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  access: service(),
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
    const newInstall = false;

    if ( newInstall ) {
      const code = {
        localCredential: {
          username: 'admin',
          password: 'admin',
        },
      };

      return get(this, 'access').login(code).then((user) => {
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

  setupController(controller, model) {
    setProperties(controller, model);
  }
});
