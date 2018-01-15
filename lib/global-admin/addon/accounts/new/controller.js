import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';
import { get, set } from '@ember/object';
import { all } from 'rsvp';

export default Controller.extend(NewOrEdit, {
  primaryResource: alias('model.account'),
  globalStore:     service(),
  settings:        service(),
  intl:            service(),
  sortBy:          'name',
  headers: [{
      name: 'name',
      sort: ['name'],
      translationKey: 'accountsPage.detail.table.headers.role',
      // width:          125,
    },
    {
      name: 'active',
      sort: ['active'],
      translationKey: 'accountsPage.detail.table.headers.active',
      // width:          125,
    },
  ],

  actions: {
    cancel() {
      this.transitionToRoute('accounts');
    },
  },

  validateDescription: computed(function () {
    return get(this, 'settings').get(C.SETTING.AUTH_LOCAL_VALIDATE_DESC) || null;
  }),

  roles: computed('model.globalRoles.[]', function () {
    return get(this, 'model.globalRoles').map((grb) => {
      return {
        name: get(grb, 'name'),
        active: false,
        globalId: get(grb, 'id')
      };
    });
  }),

  doesExist() {
    let users = get(this, 'model.users');
    let account = get(this, 'model.account');

    if (users.findBy('userName', account.get('userName'))) {
      return true;
    }

    return false;
  },

  validate: function () {
    var errors = [];

    if ((get(this, 'model.account.userName') || '').trim().length === 0) {
      errors.push(get(this, 'intl').findTranslationByKey('accountsPage.new.errors.usernameReq'));
    }

    if (this.doesExist()) {
      errors.push(get(this, 'intl').findTranslationByKey('accountsPage.new.errors.usernameInExists'));
    }

    if ((get(this, 'model.account.password') || '').trim().length === 0) {
      errors.push(get(this, 'intl').findTranslationByKey('accountsPage.new.errors.pwReq'));
    }

    if (errors.length) {
      set(this, 'errors', errors.uniq());
      return false;
    } else {
      set(this, 'errors', null);
    }

    return true;
  },

  didSave(user) {
    let promises = [];
    let store = get(this, 'globalStore');

    get(this, 'roles').forEach((role) => {
      let promise;
      if (get(role, 'active')) { // new role for user
        promise = store.createRecord({
          type: 'globalRoleBindings',
          globalRoleId: get(role, 'globalId'),
          subjectName: get(user, 'id'),
          subjectKind: 'User',
        }).save();
        promises.push(promise);
      }
    });

    return all(promises.compact()).then(( /* list */ ) => {
      return user;
    });
  },

  doneSaving() {
    this.transitionToRoute('accounts');
  }
});
