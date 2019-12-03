import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';
import { get, set } from '@ember/object';

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

  sortBy:          'name',

  globalRoleSave:  null,
  canUserLogIn:    null,

  headers:         HEADERS,

  primaryResource: alias('model.account'),

  actions:         {
    cancel() {
      this.transitionToRoute('security.accounts.users');
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

  roles: computed('model.globalRoles.[]', function() {
    return get(this, 'model.globalRoles').map((grb) => {
      return {
        name:     get(grb, 'name'),
        active:   false,
        globalId: get(grb, 'id')
      };
    });
  }),

  doesExist() {
    let users = get(this, 'model.users');
    let account = get(this, 'model.account');

    if (users.findBy('username', account.get('username'))) {
      return true;
    }

    return false;
  },

  validate() {
    var errors = [];

    if (this.canUserLogIn && !this.canUserLogIn()) {
      errors.push(this.intl.t('formGlobalRoles.loginError', { type: this.intl.t('generic.user') }));
    }

    if ((get(this, 'model.account.username') || '').trim().length === 0) {
      errors.push(get(this, 'intl').t('accountsPage.new.errors.usernameReq'));
    }

    if (this.doesExist()) {
      errors.push(get(this, 'intl').t('accountsPage.new.errors.usernameInExists'));
    }

    if ((get(this, 'model.account.password') || '').trim().length === 0) {
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

  didSave() {
    return this.globalRoleSave();
  },

  doneSaving() {
    this.transitionToRoute('security.accounts.users');
  }
});
