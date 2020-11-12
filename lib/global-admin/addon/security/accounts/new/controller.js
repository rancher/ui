import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';
import { get, set } from '@ember/object';
import { resolve } from 'rsvp';

const HEADERS = [
  {
    name:           'active',
    sort:           ['active'],
    translationKey: 'accountsPage.detail.table.headers.active',
    width:          125,
  },
  {
    name:           'name',
    sort:           ['name'],
    translationKey: 'accountsPage.detail.table.headers.role',
  },
];

export default Controller.extend(NewOrEdit, {
  globalStore:     service(),
  settings:        service(),
  intl:            service(),

  sortBy: 'name',

  globalRoleSave:      null,
  canUserLogIn:        null,
  globalRoleSaveError: false,

  password: '',

  headers: HEADERS,

  primaryResource: alias('model.account'),

  init() {
    this._super(...arguments);

    set(this, 'doSave', this._doSave.bind(this));
  },

  actions:         {
    cancel() {
      this.transitionToRoute('security.accounts.users');
    },

    setGRError() {
      set(this, 'globalRoleSaveError', true);
    },

    setGlobalRoleSave(fn) {
      set(this, 'globalRoleSave', fn);
    },

    setValidateGlobalRoles(fn) {
      set(this, 'canUserLogIn', fn);
    }
  },

  validateDescription: computed(function() {
    return get(this, 'settings').get(C.SETTING.AUTH_LOCAL_VALIDATE_DESC) || null;
  }),

  users: computed('model.users.@each.{id,state}', function() {
    const users = get(this, 'model.users');

    return users;
  }),

  roles: computed('model.globalRoles.[]', function() {
    return get(this, 'model.globalRoles').map((grb) => {
      return {
        name:     get(grb, 'name'),
        active:   false,
        globalId: get(grb, 'id')
      };
    });
  }),

  doesExist: computed('users.@each.{username,id,state}', 'model.account.username', function() {
    let users = get(this, 'users');
    let account = get(this, 'model.account');

    if (users.findBy('username', account.get('username'))) {
      return true;
    }

    return false;
  }),

  validate() {
    var errors = [];

    if (this.canUserLogIn && !this.canUserLogIn()) {
      errors.push(this.intl.t('formGlobalRoles.loginError', { type: this.intl.t('generic.user') }));
    }

    if ((get(this, 'model.account.username') || '').trim().length === 0) {
      errors.push(get(this, 'intl').t('accountsPage.new.errors.usernameReq'));
    }

    if (this.doesExist && !this.globalRoleSaveError) {
      errors.push(get(this, 'intl').t('accountsPage.new.errors.usernameInExists'));
    }

    if ((get(this, 'password') || '').trim().length === 0 && !this.globalRoleSaveError) {
      errors.push(get(this, 'intl').t('accountsPage.new.errors.pwReq'));
    }

    if (errors.length) {
      set(this, 'errors', errors.uniq());

      return false;
    } else {
      set(this, 'errors', null);
    }

    return true;
  },

  willSave() {
    set(this, 'model.account.password', get(this, 'password'));

    set(this, 'errors', null);
    var ok = this.validate();

    return ok;
  },

  didSave() {
    return this.globalRoleSave();
  },

  doneSaving() {
    this.transitionToRoute('security.accounts.users');
  },

  _doSave(opt) {
    if (get(this, 'doesExist') && this.globalRoleSaveError) {
      // we shouldn't hit this since I changed the password to be a static var instead of directly on th model.account.password and set it on save BUT if the password was cleared we don't have to reset it
      if ((get(this, 'password') || '').trim().length === 0) {
        return resolve(get(this, 'primaryResource'));
      } else {
        // else we should make sure there password is ALWAYS set to what they expect
        return get(this, 'primaryResource').save(opt).then((newData) => {
          this.mergeResult(newData);

          return this.primaryResource.doAction('setpassword', { newPassword: this.password });
        });
      }
    } else {
      return get(this, 'primaryResource').save(opt).then((newData) => {
        return this.mergeResult(newData);
      });
    }
  },

});
