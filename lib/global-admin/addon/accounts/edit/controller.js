import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get } from '@ember/object';
import {all} from 'rsvp';

export default Controller.extend({
  access:          service(),
  globalStore:     service(),
  primaryResource: alias('model.user'),
  globalRoles:     alias('model.myGlobalRoles'),
  password:        null,
  confirm:         null,
  sortBy:          'name',

  passwordsMatch: computed('password', 'confirm', function() {
    return get(this, 'password') === get(this, 'confirm') || (get(this, 'password') === '' && get(this, 'confirm') === '');
  }),

  passwordsMismatch: computed('passwordsMatch', function() {
    return !get(this, 'passwordsMatch');
  }),

  myGlobalRoles: computed('model.globalRoles.[]', 'model.globalRoleBindings.[]', function() {
    let userRoles = get(this, 'model.globalRoleBindings');
    let neu = [];
    get(this, 'model.globalRoles').forEach((grb) => {
      let tmp = {name: get(grb, 'name'), active: false, globalId: get(grb, 'id')};
      let userRole = userRoles.findBy('globalRoleId', get(grb, 'id'));
      if (userRole) {
        tmp.active=true;
        tmp.binding = userRole;
      }
      neu.push(tmp);
    });

    return neu;
  }),

  headers:  [
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
      // width:          125,
    },
  ],

  actions: {
    cancel() {
      this.transitionToRoute('accounts');
    },
    doSave(cb) {
      let promises = [];
      let store = get(this, 'globalStore');

      if (get(this, 'password.length') > 0) {
        promises.push(get(this, 'primaryResource').doAction('changepassword', {newPassword: get(this, 'password')}));
      }

      promises.push(get(this, 'primaryResource').save());

      get(this, 'myGlobalRoles').forEach((role) => {
        let promise;
        if (get(role, 'active') && !get(role, 'binding')) { // new role for user
          promise = store.createRecord({
            type: 'globalRoleBinding',
            globalRoleId: get(role, 'globalId'),
            subjectName: get(this, 'model.user.id'),
            subjectKind: 'User',
          }).save();
          promises.push(promise);
        } else if (!get(role, 'active') && get(role, 'binding')) { //active role removed
          promise = store.rawRequest({
            url: `globalRoleBindings/${get(role, 'binding.id')}`,
            method: 'DELETE'
          });
          promises.push(promise);
        }
      });
      all(promises.compact()).then((/* list */) => {
        cb(true);
        this.transitionToRoute('accounts');
      }).catch((err) => {
        cb(false);
        get(this, 'errors').push(err);
      });
    },
  },
});
